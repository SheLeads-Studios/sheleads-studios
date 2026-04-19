"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "@/components/StepHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChipPicker } from "@/components/ChipPicker";
import { progressPct, nextPath } from "@/lib/onboarding/steps";
import { createClient } from "@/lib/supabase/client";

const LANGUAGES = ["Nederlands", "Français", "English", "Deutsch"] as const;
type Lang = (typeof LANGUAGES)[number];

export default function SociodemoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [city, setCity] = useState("");
  const [dob, setDob] = useState("");
  const [languages, setLanguages] = useState<Lang[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("city,dob,languages")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        if (data.city) setCity(data.city);
        if (data.dob) setDob(data.dob);
        if (Array.isArray(data.languages)) setLanguages(data.languages as Lang[]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        city: city.trim() || null,
        dob: dob || null,
        languages,
        completion_pct: 90,
      },
      { onConflict: "user_id" }
    );
    router.push(nextPath("sociodemo"));
  }

  return (
    <form onSubmit={onSubmit}>
      <StepHeader
        eyebrow="Step 6 · The basics"
        title={
          <>
            A few <span className="italic text-primary">not-so-fun</span> details.
          </>
        }
        subtitle="Brands care about this — and we saved it for last so you could enjoy the good parts first."
        progress={progressPct("sociodemo")}
      />

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="city">City or region</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ghent"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="dob">Date of birth</Label>
          <Input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <ChipPicker
          label="Languages you speak"
          options={LANGUAGES}
          multi
          value={languages}
          onChange={(v) => setLanguages(v as Lang[])}
        />
      </div>

      <div className="mt-10 grid gap-3">
        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? "Saving…" : "Next"}
        </Button>
        <button
          type="button"
          className="text-center text-sm text-muted hover:text-foreground transition-colors"
          onClick={() => router.push(nextPath("sociodemo"))}
        >
          Skip for now
        </button>
      </div>
    </form>
  );
}
