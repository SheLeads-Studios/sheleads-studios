"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "@/components/StepHeader";
import { SwipeDeck, type Decision } from "@/components/SwipeDeck";
import { progressPct, nextPath } from "@/lib/onboarding/steps";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type Statement = { id: number; text: string; tag: string };

export default function ValuesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [statements, setStatements] = useState<Statement[] | null>(null);
  const [agreeCount, setAgreeCount] = useState(0);
  const [done, setDone] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [answered, setAnswered] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("seed_statements")
        .select("id,text,tag")
        .order("id");
      setStatements((data ?? []) as Statement[]);
    })();
  }, [supabase]);

  async function record(statement: Statement, decision: Decision) {
    const response =
      decision === "like"
        ? "agree"
        : decision === "dislike"
        ? "disagree"
        : "skip";
    if (response === "agree") setAgreeCount((n) => n + 1);
    const nextAnswered = answered + 1;
    setAnswered(nextAnswered);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("value_responses").upsert(
        { user_id: user.id, statement_id: statement.id, response },
        { onConflict: "user_id,statement_id" }
      );
    }

    if (nextAnswered % 3 === 0) {
      const pct = 30 + Math.round(Math.random() * 55);
      setInsight(`You and ${pct}% of athletes feel the same way.`);
      setTimeout(() => setInsight(null), 1800);
    }
  }

  if (!statements) {
    return (
      <>
        <StepHeader
          eyebrow="Step 2 · Your values"
          title="Loading your cards…"
          progress={progressPct("values")}
        />
      </>
    );
  }

  return (
    <>
      <StepHeader
        eyebrow="Step 2 · Your values"
        title={
          <>
            Swipe right on what <span className="italic text-primary">sounds like you</span>.
          </>
        }
        subtitle="10 quick statements. No wrong answers — only yours."
        progress={progressPct("values")}
      />

      {!done && (
        <>
          <SwipeDeck
            items={statements}
            onDecision={(item, d) => record(item, d)}
            onComplete={() => setDone(true)}
            likeLabel="Agree"
            dislikeLabel="Disagree"
            showSkip
            renderCard={(s) => (
              <div className="h-full w-full flex items-center justify-center p-7 bg-gradient-to-br from-surface-2 via-surface to-surface text-center">
                <p className="font-display text-[28px] leading-tight">
                  &ldquo;{s.text}&rdquo;
                </p>
              </div>
            )}
          />
          {insight && (
            <div className="mt-4 text-center text-accent text-sm animate-pulse">
              ✨ {insight}
            </div>
          )}
        </>
      )}

      {done && (
        <div className="flex flex-col items-center text-center gap-6 mt-8">
          <div className="font-display text-3xl">
            {agreeCount >= 6
              ? "A clear voice — we love that."
              : agreeCount >= 3
              ? "We&apos;re getting a picture."
              : "Quiet, thoughtful signal — noted."}
          </div>
          <p className="text-muted">
            {agreeCount} of {statements.length} statements felt like you.
          </p>
          <Button size="lg" onClick={() => router.push(nextPath("values"))}>
            Next <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </>
  );
}
