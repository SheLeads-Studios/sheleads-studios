"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StepHeader } from "@/components/StepHeader";
import { SwipeDeck, type Decision } from "@/components/SwipeDeck";
import { progressPct, nextPath } from "@/lib/onboarding/steps";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type Athlete = {
  id: number;
  name: string;
  sport: string;
  tagline: string | null;
  photo_url: string | null;
};

export default function AthletesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [athletes, setAthletes] = useState<Athlete[] | null>(null);
  const [done, setDone] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("seed_athletes")
        .select("id,name,sport,tagline,photo_url")
        .order("id");
      setAthletes((data ?? []) as Athlete[]);
    })();
  }, [supabase]);

  async function record(athlete: Athlete, decision: Decision) {
    if (decision === "skip") return;
    if (decision === "like") setLikes((n) => n + 1);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("swipes").upsert(
        {
          user_id: user.id,
          target_type: "athlete",
          target_id: athlete.id,
          direction: decision,
        },
        { onConflict: "user_id,target_type,target_id" }
      );
    }
  }

  if (!athletes) {
    return (
      <StepHeader
        eyebrow="Step 3 · Inspiration"
        title="Loading athletes…"
        progress={progressPct("athletes")}
      />
    );
  }

  return (
    <>
      <StepHeader
        eyebrow="Step 3 · Inspiration"
        title={
          <>
            Who&apos;s your <span className="italic text-primary">kind of</span> athlete?
          </>
        }
        subtitle="Swipe right on the ones whose story resonates."
        progress={progressPct("athletes")}
      />

      {!done ? (
        <SwipeDeck
          items={athletes}
          onDecision={(a, d) => record(a, d)}
          onComplete={() => setDone(true)}
          renderCard={(a) => (
            <div className="relative h-full w-full">
              {a.photo_url && (
                <Image
                  src={a.photo_url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 90vw, 384px"
                  className="object-cover"
                  unoptimized
                  priority={false}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="font-display text-2xl">{a.name}</div>
                <div className="mt-0.5 text-sm text-white/80">{a.sport}</div>
                {a.tagline && (
                  <div className="mt-2 text-sm text-white/70">{a.tagline}</div>
                )}
              </div>
            </div>
          )}
        />
      ) : (
        <div className="flex flex-col items-center text-center gap-6 mt-8">
          <div className="font-display text-3xl">
            {likes >= 6 ? "You like bold company." : likes >= 2 ? "A tight, selective taste." : "Picky — we respect it."}
          </div>
          <Button size="lg" onClick={() => router.push(nextPath("athletes"))}>
            Next <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </>
  );
}
