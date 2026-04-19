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

type Brand = {
  id: number;
  name: string;
  category: string;
  tagline: string | null;
  photo_url: string | null;
  city: string | null;
};

export default function BrandsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [done, setDone] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("seed_brands")
        .select("id,name,category,tagline,photo_url,city")
        .order("id");
      setBrands((data ?? []) as Brand[]);
    })();
  }, [supabase]);

  async function record(brand: Brand, decision: Decision) {
    if (decision === "skip") return;
    if (decision === "like") setLikes((n) => n + 1);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("swipes").upsert(
        {
          user_id: user.id,
          target_type: "brand",
          target_id: brand.id,
          direction: decision,
        },
        { onConflict: "user_id,target_type,target_id" }
      );
    }
  }

  if (!brands) {
    return (
      <StepHeader
        eyebrow="Step 4 · Brand vibes"
        title="Loading brands…"
        progress={progressPct("brands")}
      />
    );
  }

  return (
    <>
      <StepHeader
        eyebrow="Step 4 · Brand vibes"
        title={
          <>
            Which brands are <span className="italic text-primary">your</span> vibe?
          </>
        }
        subtitle="All local Belgian labels. No judgement — just taste."
        progress={progressPct("brands")}
      />

      {!done ? (
        <SwipeDeck
          items={brands}
          onDecision={(b, d) => record(b, d)}
          onComplete={() => setDone(true)}
          renderCard={(b) => (
            <div className="relative h-full w-full">
              {b.photo_url && (
                <Image
                  src={b.photo_url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 90vw, 384px"
                  className="object-cover"
                  unoptimized
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur text-white/90 text-xs uppercase tracking-wider">
                {b.category}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="font-display text-2xl">{b.name}</div>
                {b.city && (
                  <div className="mt-0.5 text-sm text-white/80">{b.city}</div>
                )}
                {b.tagline && (
                  <div className="mt-2 text-sm text-white/70">{b.tagline}</div>
                )}
              </div>
            </div>
          )}
        />
      ) : (
        <div className="flex flex-col items-center text-center gap-6 mt-8">
          <div className="font-display text-3xl">
            {likes >= 6 ? "Wide taste — lots to match on." : likes >= 2 ? "A clear direction." : "Ultra-selective — got it."}
          </div>
          <Button size="lg" onClick={() => router.push(nextPath("brands"))}>
            Next <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </>
  );
}
