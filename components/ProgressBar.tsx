"use client";

import { motion } from "framer-motion";

export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Profile strength"}
        className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden"
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      {label && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(clamped)}%</span>
        </div>
      )}
    </div>
  );
}
