"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, MessageCircle, Share2 } from "lucide-react";

type Fan = {
  id: string;
  name: string;
  relationship: string;
  token: string | null;
};

export function FanInviteCard({
  fan,
  index,
  onChange,
  onSave,
  athleteName,
}: {
  fan: Fan;
  index: number;
  onChange: (next: Fan) => void;
  onSave: () => Promise<string | null>;
  athleteName: string;
}) {
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const link = fan.token ? `${origin}/fan/${fan.token}` : null;

  const message = encodeURIComponent(
    `Hey! I'm building my profile on SheLeads Studios and ${athleteName || "I"} need your voice. Takes 1 min: {link}`.replace(
      "{link}",
      link ?? ""
    )
  );

  async function save() {
    if (!fan.name.trim()) return;
    setSaving(true);
    await onSave();
    setSaving(false);
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-2xl border border-border-strong bg-surface p-4 grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted">
          Fan #{index + 1}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Input
          placeholder="Their name"
          value={fan.name}
          onChange={(e) => onChange({ ...fan, name: e.target.value })}
          disabled={!!fan.token}
        />
      </div>

      {!fan.token ? (
        <>
          <div className="flex flex-wrap gap-2">
            {["Coach", "Friend", "Family", "Teammate"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChange({ ...fan, relationship: r })}
                className={`h-9 px-3 text-xs rounded-full border transition-colors ${
                  fan.relationship === r
                    ? "bg-primary text-primary-ink border-primary"
                    : "bg-surface-2 text-foreground border-border-strong hover:bg-surface"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={save}
            disabled={!fan.name.trim() || saving}
          >
            {saving ? "Creating link…" : "Generate invite link"}
          </Button>
        </>
      ) : (
        <>
          <div className="rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted overflow-hidden">
            <div className="truncate">{link}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <a
              href={`https://wa.me/?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm rounded-full bg-surface text-foreground border border-border-strong hover:bg-surface-2"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
            <button
              type="button"
              onClick={async () => {
                if (link && navigator.share) {
                  try {
                    await navigator.share({
                      title: "SheLeads — hype me up",
                      text: `${athleteName || "Your athlete"} asked for your voice — takes 1 min.`,
                      url: link,
                    });
                  } catch {}
                } else {
                  copy();
                }
              }}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm rounded-full bg-surface text-foreground border border-border-strong hover:bg-surface-2"
            >
              <Share2 className="size-4" />
              Share
            </button>
          </div>
        </>
      )}
    </div>
  );
}
