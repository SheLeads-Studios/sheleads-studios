"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useMotionValueEvent,
} from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Decision = "like" | "dislike" | "skip";

export function SwipeDeck<T extends { id: number | string }>({
  items,
  renderCard,
  onDecision,
  onComplete,
  likeLabel = "Like",
  dislikeLabel = "Pass",
  showSkip = false,
}: {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  onDecision: (item: T, decision: Decision) => void;
  onComplete?: () => void;
  likeLabel?: string;
  dislikeLabel?: string;
  showSkip?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const remaining = items.slice(index);
  const current = remaining[0];

  const advance = (decision: Decision) => {
    if (!current) return;
    onDecision(current, decision);
    const next = index + 1;
    setIndex(next);
    if (next >= items.length) onComplete?.();
  };

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
        <div className="text-muted">That's the deck.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full gap-6">
      <div className="relative w-full aspect-[3/4] max-w-sm">
        <AnimatePresence initial={false}>
          {remaining.slice(0, 3).reverse().map((item, idx) => {
            const depth = remaining.slice(0, 3).length - 1 - idx;
            const isTop = depth === 0;
            return (
              <DeckCard
                key={item.id}
                isTop={isTop}
                depth={depth}
                onDragDecision={(d) => advance(d)}
              >
                {renderCard(item)}
              </DeckCard>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-6 w-full">
        <Button
          variant="secondary"
          size="icon"
          aria-label={dislikeLabel}
          onClick={() => advance("dislike")}
        >
          <X className="size-5" />
        </Button>
        {showSkip && (
          <Button
            variant="ghost"
            size="sm"
            aria-label="Skip"
            onClick={() => advance("skip")}
          >
            Skip
          </Button>
        )}
        <Button
          size="icon"
          aria-label={likeLabel}
          onClick={() => advance("like")}
        >
          <Heart className="size-5" />
        </Button>
      </div>

      <div className="text-xs text-muted tabular-nums">
        {index + 1} / {items.length}
      </div>
    </div>
  );
}

function DeckCard({
  isTop,
  depth,
  onDragDecision,
  children,
}: {
  isTop: boolean;
  depth: number;
  onDragDecision: (d: Decision) => void;
  children: React.ReactNode;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -40], [1, 0]);
  const [decided, setDecided] = useState<Decision | null>(null);

  useMotionValueEvent(x, "change", (latest) => {
    // noop — keeping as a hook for future haptic/sound
    void latest;
  });

  const scale = isTop ? 1 : 1 - depth * 0.04;
  const yOffset = depth * 10;

  return (
    <motion.div
      className={cn(
        "absolute inset-0 rounded-3xl overflow-hidden bg-surface shadow-xl",
        "border border-border-strong will-change-transform",
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      )}
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0 }}
      initial={{ scale, y: yOffset, opacity: 0 }}
      animate={{
        scale,
        y: yOffset,
        opacity: 1,
        x: decided === "like" ? 500 : decided === "dislike" ? -500 : 0,
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      drag={isTop ? "x" : false}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (!isTop) return;
        const dx = info.offset.x;
        const v = info.velocity.x;
        if (dx > 120 || v > 600) {
          setDecided("like");
          setTimeout(() => onDragDecision("like"), 160);
        } else if (dx < -120 || v < -600) {
          setDecided("dislike");
          setTimeout(() => onDragDecision("dislike"), 160);
        }
      }}
    >
      {isTop && (
        <>
          <motion.div
            aria-hidden
            className="absolute top-5 left-5 z-10 px-3 py-1 rounded-full border-2 border-[#52D17A] text-[#52D17A] font-semibold tracking-widest text-xs uppercase rotate-[-8deg]"
            style={{ opacity: likeOpacity }}
          >
            Like
          </motion.div>
          <motion.div
            aria-hidden
            className="absolute top-5 right-5 z-10 px-3 py-1 rounded-full border-2 border-primary text-primary font-semibold tracking-widest text-xs uppercase rotate-[8deg]"
            style={{ opacity: nopeOpacity }}
          >
            Nope
          </motion.div>
        </>
      )}
      {children}
    </motion.div>
  );
}
