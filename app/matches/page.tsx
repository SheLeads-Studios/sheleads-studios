"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/MatchCard";
import { HypeSquadRow } from "@/components/HypeSquadRow";
import { createClient } from "@/lib/supabase/client";
import { scoreBrands, type Brand, type MatchResult } from "@/lib/matching/score";
import { Sparkles } from "lucide-react";

type FanSlot = {
  id: number;
  fan_name_suggested: string;
  fan_name_actual: string | null;
  testimonial: string | null;
  status: string;
  invite_token: string;
};

export default function MatchesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [athleteName, setAthleteName] = useState<string>("");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [fans, setFans] = useState<FanSlot[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [
        { data: profile },
        { data: sports },
        { data: values },
        { data: likedBrandSwipes },
        { data: brands },
        { data: socials },
        { data: fanRows },
      ] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
        supabase.from("athlete_sports").select("sport").eq("user_id", user.id),
        supabase
          .from("value_responses")
          .select("statement_id,response")
          .eq("user_id", user.id)
          .eq("response", "agree"),
        supabase
          .from("swipes")
          .select("target_id")
          .eq("user_id", user.id)
          .eq("target_type", "brand")
          .eq("direction", "like"),
        supabase.from("seed_brands").select("*"),
        supabase.from("social_handles").select("scan_result").eq("user_id", user.id),
        supabase
          .from("fan_testimonials")
          .select("id,fan_name_suggested,fan_name_actual,testimonial,status,invite_token")
          .eq("user_id", user.id)
          .order("created_at"),
      ]);

      setAthleteName(profile?.display_name ?? "");
      const { data: statements } = await supabase
        .from("seed_statements")
        .select("id,tag");
      const tagById = new Map<number, string>(
        (statements ?? []).map((s) => [s.id, s.tag])
      );
      const likedValueTags =
        (values ?? [])
          .map((r) => tagById.get(r.statement_id))
          .filter((t): t is string => !!t) ?? [];

      const likedBrandIds = new Set(
        (likedBrandSwipes ?? []).map((r) => r.target_id)
      );
      const allBrands = (brands ?? []) as Brand[];
      const likedBrands = allBrands.filter((b) => likedBrandIds.has(b.id));

      const audienceHints = (socials ?? [])
        .flatMap((s) => (s.scan_result as { audience_hints?: string[] })?.audience_hints ?? [])
        .filter((v, i, a) => a.indexOf(v) === i);

      const results = scoreBrands(allBrands, {
        likedValueTags,
        likedBrands,
        sports: (sports ?? []).map((s) => s.sport),
        audienceHints,
      });

      setMatches(results);
      setFans((fanRows ?? []) as FanSlot[]);

      if (results.length > 0) {
        await supabase.from("matches").delete().eq("user_id", user.id);
        await supabase.from("matches").insert(
          results.map((r) => ({
            user_id: user.id,
            brand_id: r.brand.id,
            score: r.score,
            reason_tags: r.reasonTags,
          }))
        );
        await supabase
          .from("profiles")
          .update({ completion_pct: 100 })
          .eq("user_id", user.id);
      }

      setLoading(false);

      // Subtle celebration
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.2 },
          colors: ["#FF4D6D", "#FFD3B6", "#F5F0EA"],
          disableForReducedMotion: true,
        });
      }, 400);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto w-full max-w-md px-5 pt-10 pb-12">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted">
          <Sparkles className="size-4 text-primary" />
          Your brand matches
        </div>
        <h1 className="mt-4 font-display text-[40px] leading-[1.04] tracking-tight">
          {athleteName ? (
            <>
              {athleteName}, meet your <span className="italic text-primary">match list</span>.
            </>
          ) : (
            <>Meet your <span className="italic text-primary">match list</span>.</>
          )}
        </h1>
        <p className="mt-3 text-muted">
          Based on your values, brand taste, and audience — here are local
          Belgian brands worth knowing.
        </p>

        {loading && (
          <div className="mt-10 text-center text-muted">Finding your people…</div>
        )}

        {!loading && matches.length === 0 && (
          <div className="mt-10 rounded-3xl border border-border-strong bg-surface p-6 text-center">
            <div className="font-display text-2xl">Not enough signal yet.</div>
            <p className="mt-2 text-muted text-sm">
              Go back and like a few brands — the engine needs a little food.
            </p>
            <Link href="/onboarding/brands" className="block mt-5">
              <Button variant="secondary" className="w-full">
                Back to brand vibes
              </Button>
            </Link>
          </div>
        )}

        {!loading && matches.length > 0 && (
          <div className="mt-8 grid gap-4">
            {matches.map((m, i) => (
              <MatchCard
                key={m.brand.id}
                brand={m.brand}
                score={m.score}
                reason={m.reason}
                rank={i}
              />
            ))}
          </div>
        )}

        <HypeSquadRow fans={fans} />

        <div className="mt-10 grid gap-3">
          <Link href="/onboarding/fans" className="block">
            <Button variant="secondary" className="w-full">
              {fans.length > 0 ? "Invite another fan" : "Invite my hype squad"}
            </Button>
          </Link>
          <div className="rounded-2xl bg-surface-2 p-4 text-xs text-muted-2 text-center">
            ✨ Paid soon: AI tools to help you build your personal brand.
          </div>
        </div>
      </div>
    </main>
  );
}
