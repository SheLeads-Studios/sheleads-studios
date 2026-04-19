"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "@/components/StepHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanAnimation } from "@/components/ScanAnimation";
import { progressPct, nextPath } from "@/lib/onboarding/steps";
import { createClient } from "@/lib/supabase/client";
import { fakeScan, type FakeScanResult } from "@/lib/stub/fakeScan";
import { Camera, Music2, Film, Sparkles } from "lucide-react";

type Platform = "instagram" | "tiktok" | "youtube";

const ROWS: { platform: Platform; label: string; icon: React.ElementType; placeholder: string }[] = [
  { platform: "instagram", label: "Instagram", icon: Camera,  placeholder: "@yourhandle" },
  { platform: "tiktok",    label: "TikTok",    icon: Music2,  placeholder: "@yourhandle" },
  { platform: "youtube",   label: "YouTube",   icon: Film,    placeholder: "channel name" },
];

type Result = { platform: Platform; handle: string; scan: FakeScanResult };

export default function SocialPage() {
  const router = useRouter();
  const supabase = createClient();
  const [handles, setHandles] = useState<Record<Platform, string>>({
    instagram: "", tiktok: "", youtube: "",
  });
  const [phase, setPhase] = useState<"input" | "scanning" | "done">("input");
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("social_handles")
        .select("platform,handle")
        .eq("user_id", user.id);
      if (data?.length) {
        const next = { ...handles };
        for (const row of data) {
          if (row.platform in next) next[row.platform as Platform] = row.handle;
        }
        setHandles(next);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const anyHandle = Object.values(handles).some((v) => v.trim().length > 0);

  async function onScan(e: React.FormEvent) {
    e.preventDefault();
    if (!anyHandle) return;
    setPhase("scanning");

    const { data: { user } } = await supabase.auth.getUser();
    const entered = (Object.entries(handles) as [Platform, string][])
      .filter(([, h]) => h.trim())
      .map(([platform, handle]) => {
        const scan = fakeScan(platform, handle);
        return { platform, handle: handle.trim(), scan };
      });

    if (user) {
      for (const r of entered) {
        await supabase.from("social_handles").upsert(
          { user_id: user.id, platform: r.platform, handle: r.handle, scan_result: r.scan },
          { onConflict: "user_id,platform" }
        );
      }
    }
    setResults(entered);
  }

  return (
    <>
      <StepHeader
        eyebrow="Step 5 · Your reach"
        title={
          <>
            Let&apos;s peek at your <span className="italic text-primary">socials</span>.
          </>
        }
        subtitle="Drop any handle you&apos;re comfortable sharing. We&apos;ll scan what&apos;s already public — nothing more."
        progress={progressPct("social")}
      />

      {phase === "input" && (
        <form onSubmit={onScan} className="grid gap-5">
          {ROWS.map(({ platform, label, icon: Icon, placeholder }) => (
            <div key={platform} className="grid gap-2">
              <Label htmlFor={platform} className="flex items-center gap-2 normal-case tracking-normal text-foreground">
                <Icon className="size-4 text-primary" />
                {label}
              </Label>
              <Input
                id={platform}
                value={handles[platform]}
                onChange={(e) =>
                  setHandles({ ...handles, [platform]: e.target.value })
                }
                placeholder={placeholder}
              />
            </div>
          ))}
          <Button type="submit" size="lg" disabled={!anyHandle}>
            <Sparkles className="size-4" />
            Scan my reach
          </Button>
          <button
            type="button"
            className="text-center text-sm text-muted hover:text-foreground transition-colors"
            onClick={() => router.push(nextPath("social"))}
          >
            Skip for now
          </button>
        </form>
      )}

      {phase === "scanning" && (
        <ScanAnimation durationMs={3000} onDone={() => setPhase("done")} />
      )}

      {phase === "done" && (
        <div className="grid gap-4">
          <div className="font-display text-2xl">Look at you.</div>
          <div className="grid gap-3">
            {results.map((r) => (
              <div
                key={r.platform}
                className="rounded-2xl border border-border-strong bg-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted capitalize">{r.platform}</div>
                  <div className="text-xs text-muted-2">{r.handle}</div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <Stat label="Followers" value={r.scan.followers.toLocaleString()} />
                  <Stat label="Engagement" value={`${r.scan.engagement_rate}%`} />
                  <Stat label="Belgium" value={`${r.scan.audience_belgium_pct}%`} />
                </div>
                <div className="mt-3 text-xs text-muted">
                  Audience: {r.scan.audience_age} · {r.scan.audience_female_pct}% female · top topics: {r.scan.top_topics.join(", ")}
                </div>
              </div>
            ))}
          </div>
          <Button size="lg" onClick={() => router.push(nextPath("social"))}>
            Next
          </Button>
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-2">{label}</div>
      <div className="mt-0.5 font-display text-xl">{value}</div>
    </div>
  );
}
