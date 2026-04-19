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

const SPORTS = [
  "Athletics", "Cycling", "Football", "Running", "Climbing",
  "Swimming", "Tennis", "Hockey", "Boxing", "Gymnastics",
  "Triathlon", "Skateboarding", "Roller derby", "Cricket",
  "Para-athletics", "Surfing",
] as const;

type Sport = (typeof SPORTS)[number];

const LEVELS = ["Hobby", "Club", "Regional", "National", "International"] as const;
type Level = (typeof LEVELS)[number];

const FREQUENCIES = ["1–2×/week", "3–4×/week", "5–6×/week", "Daily"] as const;
type Frequency = (typeof FREQUENCIES)[number];

export default function IdentityPage() {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [sports, setSports] = useState<Sport[]>([]);
  const [level, setLevel] = useState<Level | null>(null);
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [achievement, setAchievement] = useState("");
  const [ambition, setAmbition] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile?.display_name) setDisplayName(profile.display_name);
      const { data: rows } = await supabase
        .from("athlete_sports")
        .select("sport, level, frequency, achievement, ambition")
        .eq("user_id", user.id);
      if (rows && rows.length) {
        setSports(rows.map((r) => r.sport as Sport));
        setLevel(rows[0].level as Level);
        setFrequency(rows[0].frequency as Frequency);
        setAchievement(rows[0].achievement ?? "");
        setAmbition(rows[0].ambition ?? "");
      }
    })();
  }, [supabase]);

  const canSubmit =
    displayName.trim().length > 1 &&
    sports.length > 0 &&
    level !== null &&
    frequency !== null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    await supabase.from("profiles").upsert(
      { user_id: user.id, display_name: displayName.trim() },
      { onConflict: "user_id" }
    );
    // Rewrite athlete_sports rows for this user (simple: clear + insert)
    await supabase.from("athlete_sports").delete().eq("user_id", user.id);
    const rows = sports.map((sport) => ({
      user_id: user.id,
      sport,
      level: level!,
      frequency: frequency!,
      achievement: achievement.trim() || null,
      ambition: ambition.trim() || null,
    }));
    await supabase.from("athlete_sports").insert(rows);
    router.push(nextPath("identity"));
  }

  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col">
      <StepHeader
        eyebrow="Step 1 · Your sport"
        title={
          <>
            First things first — <span className="italic text-primary">who are you</span> on the field?
          </>
        }
        subtitle="Pick as many sports as apply. You can fine-tune later."
        progress={progressPct("identity")}
      />

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">First name</Label>
          <Input
            id="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Lou"
            autoComplete="given-name"
          />
        </div>

        <ChipPicker
          label="Sport(s)"
          options={SPORTS}
          multi
          value={sports}
          onChange={(v) => setSports(v as Sport[])}
        />
        <ChipPicker
          label="Level"
          options={LEVELS}
          value={level}
          onChange={(v) => setLevel(v as Level)}
        />
        <ChipPicker
          label="How often you train"
          options={FREQUENCIES}
          value={frequency}
          onChange={(v) => setFrequency(v as Frequency)}
        />

        <div className="grid gap-2">
          <Label htmlFor="achievement">Proudest moment (optional)</Label>
          <Input
            id="achievement"
            value={achievement}
            onChange={(e) => setAchievement(e.target.value)}
            placeholder="First podium at nationals"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ambition">Where are you headed?</Label>
          <Input
            id="ambition"
            value={ambition}
            onChange={(e) => setAmbition(e.target.value)}
            placeholder="Olympic trials 2028"
          />
        </div>
      </div>

      <div className="mt-10">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!canSubmit || saving}
        >
          {saving ? "Saving…" : "Next"}
        </Button>
      </div>
    </form>
  );
}
