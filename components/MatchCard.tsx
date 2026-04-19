"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Brand } from "@/lib/matching/score";

export function MatchCard({
  brand,
  score,
  reason,
  rank,
}: {
  brand: Brand;
  score: number;
  reason: string;
  rank: number;
}) {
  const pct = Math.round(score * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: rank * 0.08, type: "spring", stiffness: 140, damping: 20 }}
      className="relative rounded-3xl overflow-hidden border border-border-strong bg-surface"
    >
      <div className="relative h-40 w-full">
        {brand.photo_url && (
          <Image
            src={brand.photo_url}
            alt=""
            fill
            sizes="(max-width: 640px) 90vw, 384px"
            className="object-cover"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur text-white/90 text-xs uppercase tracking-wider">
          {brand.category}
        </div>
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primary-ink text-xs font-semibold tabular-nums">
          {pct}% match
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="font-display text-2xl">{brand.name}</div>
          <div className="mt-0.5 text-sm text-white/70">
            {brand.city ?? "Belgium"} · {brand.size ?? "local"}
          </div>
        </div>
      </div>
      <div className="p-4 text-sm text-foreground/90">{reason}</div>
    </motion.div>
  );
}
