"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const LINES = [
  "Scanning recent posts…",
  "Reading your captions…",
  "Mapping your audience…",
  "Matching your topics…",
  "Finding your magic…",
];

export function ScanAnimation({
  durationMs = 3000,
  onDone,
}: {
  durationMs?: number;
  onDone?: () => void;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const step = durationMs / LINES.length;
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % LINES.length);
    }, step);
    const finish = setTimeout(() => onDone?.(), durationMs);
    return () => {
      clearInterval(interval);
      clearTimeout(finish);
    };
  }, [durationMs, onDone]);

  return (
    <div className="w-full rounded-3xl border border-border-strong bg-surface p-8 flex flex-col items-center gap-6">
      <div className="relative size-24">
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-3 rounded-full border-2 border-accent/40"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-10 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/50" />
        </div>
      </div>
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-muted text-sm tracking-wide"
      >
        {LINES[idx]}
      </motion.div>
    </div>
  );
}
