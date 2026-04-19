"use client";

import { cn } from "@/lib/utils";

export function ChipPicker<T extends string>({
  options,
  value,
  onChange,
  multi = false,
  label,
}: {
  options: readonly T[] | T[];
  value: T[] | T | null;
  onChange: (next: T[] | T) => void;
  multi?: boolean;
  label?: string;
}) {
  const selected = multi
    ? (value as T[]) ?? []
    : value
    ? ([value as T] as T[])
    : [];

  const toggle = (opt: T) => {
    if (multi) {
      const arr = selected.includes(opt)
        ? selected.filter((x) => x !== opt)
        : [...selected, opt];
      onChange(arr);
    } else {
      onChange(opt);
    }
  };

  return (
    <div className="grid gap-2">
      {label && (
        <span className="text-sm font-medium text-muted uppercase tracking-wide">
          {label}
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSel = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                "h-10 px-4 rounded-full text-sm border transition-all",
                isSel
                  ? "bg-primary text-primary-ink border-primary"
                  : "bg-surface text-foreground border-border-strong hover:bg-surface-2"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
