"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "@/components/StepHeader";
import { Button } from "@/components/ui/button";
import { FanInviteCard } from "@/components/FanInviteCard";
import { progressPct } from "@/lib/onboarding/steps";
import { createClient } from "@/lib/supabase/client";
import { makeInviteToken } from "@/lib/tokens";
import { Sparkles } from "lucide-react";

type Fan = { id: string; name: string; relationship: string; token: string | null };

function blank(): Fan {
  return {
    id: Math.random().toString(36).slice(2),
    name: "",
    relationship: "",
    token: null,
  };
}

export default function FansPage() {
  const router = useRouter();
  const supabase = createClient();
  const [athleteName, setAthleteName] = useState("");
  const [fans, setFans] = useState<Fan[]>([blank(), blank(), blank()]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile?.display_name) setAthleteName(profile.display_name);

      const { data } = await supabase
        .from("fan_testimonials")
        .select("id,fan_name_suggested,relationship,invite_token,status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (data?.length) {
        const loaded: Fan[] = data.slice(0, 3).map((r) => ({
          id: String(r.id),
          name: r.fan_name_suggested,
          relationship: r.relationship ?? "",
          token: r.invite_token,
        }));
        while (loaded.length < 3) loaded.push(blank());
        setFans(loaded);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveFan(idx: number): Promise<string | null> {
    const fan = fans[idx];
    if (!fan.name.trim()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const token = makeInviteToken();
    const { error } = await supabase.from("fan_testimonials").insert({
      user_id: user.id,
      fan_name_suggested: fan.name.trim(),
      relationship: fan.relationship || null,
      invite_token: token,
    });
    if (error) return null;
    const next = [...fans];
    next[idx] = { ...fan, token };
    setFans(next);
    return token;
  }

  return (
    <>
      <StepHeader
        eyebrow="Bonus · Your hype squad"
        title={
          <>
            Who knows your <span className="italic text-primary">story best</span>?
          </>
        }
        subtitle="Invite up to 3 people whose voice would mean something on your profile. We&apos;ll make a link — you choose how to send it."
        progress={95}
      />

      <div className="grid gap-3">
        {fans.map((fan, idx) => (
          <FanInviteCard
            key={fan.id}
            fan={fan}
            index={idx}
            athleteName={athleteName}
            onChange={(next) => {
              const all = [...fans];
              all[idx] = next;
              setFans(all);
            }}
            onSave={() => saveFan(idx)}
          />
        ))}
      </div>

      <div className="mt-10 grid gap-3">
        <Button size="lg" onClick={() => router.push("/matches")}>
          <Sparkles className="size-4" />
          See my matches
        </Button>
        <button
          type="button"
          className="text-center text-sm text-muted hover:text-foreground transition-colors"
          onClick={() => router.push("/matches")}
        >
          Skip — straight to matches
        </button>
      </div>
    </>
  );
}
