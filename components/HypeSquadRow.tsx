"use client";

import { useState } from "react";
import { Copy, Check, Clock } from "lucide-react";

type FanSlot = {
  id: number;
  fan_name_suggested: string;
  fan_name_actual: string | null;
  testimonial: string | null;
  status: string;
  invite_token: string;
};

export function HypeSquadRow({ fans }: { fans: FanSlot[] }) {
  if (fans.length === 0) return null;
  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl">Your hype squad</h2>
        <span className="text-xs text-muted-2">
          {fans.filter((f) => f.status === "completed").length}/{fans.length} in
        </span>
      </div>
      <div className="mt-3 grid gap-3">
        {fans.map((f) => (
          <FanTile key={f.id} fan={f} />
        ))}
      </div>
    </section>
  );
}

function FanTile({ fan }: { fan: FanSlot }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/fan/${fan.invite_token}`;

  if (fan.status === "completed" && fan.testimonial) {
    return (
      <div className="rounded-2xl bg-surface border border-border-strong p-4">
        <div className="text-sm text-muted">
          {fan.fan_name_actual ?? fan.fan_name_suggested}
        </div>
        <p className="mt-1 font-display text-lg leading-snug">
          &ldquo;{fan.testimonial}&rdquo;
        </p>
      </div>
    );
  }

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-2xl bg-surface border border-dashed border-border-strong p-4 flex items-center gap-3">
      <Clock className="size-4 text-muted-2" />
      <div className="flex-1 text-sm text-muted">
        Waiting for{" "}
        <span className="text-foreground">{fan.fan_name_suggested}</span>…
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? "Copied" : "Nudge them"}
      </button>
    </div>
  );
}
