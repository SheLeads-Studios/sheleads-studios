"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-12 w-full rounded-2xl bg-surface border border-border-strong px-4 text-base text-foreground placeholder:text-muted-2 outline-none focus:border-primary/60 focus:bg-surface-2 transition-colors disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
