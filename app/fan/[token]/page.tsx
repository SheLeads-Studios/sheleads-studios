"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, CheckCircle2 } from "lucide-react";

type Invite = {
  athlete_name: string | null;
  fan_name_suggested: string;
  status: string;
};

export default function FanInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const supabase = createClient();
  const [invite, setInvite] = useState<Invite | null | undefined>(undefined);
  const [testimonial, setTestimonial] = useState("");
  const [fanName, setFanName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_fan_invite", {
        p_token: token,
      });
      if (error || !data || (Array.isArray(data) && data.length === 0)) {
        setInvite(null);
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      setInvite(row as Invite);
      setFanName(row.fan_name_suggested ?? "");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (testimonial.trim().length < 3) return;
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase.rpc("submit_fan_testimonial", {
      p_token: token,
      p_testimonial: testimonial.trim(),
      p_fan_name: fanName.trim(),
      p_relationship: relationship,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data === false) {
      setError("This invite has already been used or has expired.");
      return;
    }
    setDone(true);
  }

  if (invite === undefined) {
    return (
      <main className="flex-1 flex items-center justify-center p-10">
        <div className="text-muted">Loading…</div>
      </main>
    );
  }

  if (invite === null) {
    return (
      <main className="flex-1 flex items-center justify-center p-10 text-center">
        <div className="max-w-sm">
          <div className="font-display text-3xl">Hmm.</div>
          <p className="mt-3 text-muted">
            This invite link isn&apos;t valid, or it&apos;s already been used.
            Ask your athlete for a fresh one.
          </p>
        </div>
      </main>
    );
  }

  if (done || invite.status === "completed") {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-3xl border border-border-strong bg-surface p-8 text-center">
          <CheckCircle2 className="size-10 text-primary mx-auto" />
          <div className="mt-4 font-display text-3xl">
            {done ? "Sent. Thank you." : "Already submitted."}
          </div>
          <p className="mt-3 text-muted">
            {invite.athlete_name ?? "Your athlete"} will see your words on their
            profile.
          </p>
          <div className="mt-6 rounded-2xl bg-surface-2 p-4 text-sm text-muted">
            An athlete yourself? Build your own SheLeads profile — free for now.
          </div>
          <Link href="/" className="block mt-4">
            <Button size="md" variant="secondary" className="w-full">
              See SheLeads Studios
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-6 pt-10 pb-10 max-w-md mx-auto w-full">
      <div className="flex items-center gap-2 text-sm tracking-widest uppercase text-muted">
        <Sparkles className="size-4 text-primary" />
        SheLeads Studios
      </div>

      <h1 className="mt-6 font-display text-3xl leading-tight tracking-tight">
        {invite.athlete_name
          ? `${invite.athlete_name} asked for your voice.`
          : "Your athlete asked for your voice."}
      </h1>
      <p className="mt-3 text-muted">
        In 1–2 sentences, what&apos;s something brands should know about
        {" "}{invite.athlete_name ?? "them"}?
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="testimonial">Your words</Label>
          <textarea
            id="testimonial"
            required
            minLength={3}
            maxLength={600}
            rows={5}
            className="w-full rounded-2xl bg-surface border border-border-strong px-4 py-3 text-base text-foreground placeholder:text-muted-2 outline-none focus:border-primary/60 focus:bg-surface-2 transition-colors resize-none"
            placeholder="She shows up when it's hardest…"
            value={testimonial}
            onChange={(e) => setTestimonial(e.target.value)}
          />
          <div className="text-right text-xs text-muted-2 tabular-nums">
            {testimonial.length}/600
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fanname">Your name (optional)</Label>
          <Input
            id="fanname"
            value={fanName}
            onChange={(e) => setFanName(e.target.value)}
            placeholder="How you want to be credited"
          />
        </div>

        <div className="grid gap-2">
          <Label>Your relationship (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {["Coach", "Friend", "Family", "Teammate"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRelationship(r)}
                className={`h-10 px-4 text-sm rounded-full border transition-colors ${
                  relationship === r
                    ? "bg-primary text-primary-ink border-primary"
                    : "bg-surface text-foreground border-border-strong hover:bg-surface-2"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-primary">{error}</p>}

        <Button
          type="submit"
          size="lg"
          disabled={submitting || testimonial.trim().length < 3}
        >
          {submitting ? "Sending…" : "Send my words"}
        </Button>
      </form>
    </main>
  );
}
