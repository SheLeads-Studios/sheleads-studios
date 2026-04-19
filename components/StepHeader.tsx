import { ProgressBar } from "@/components/ProgressBar";

export function StepHeader({
  eyebrow,
  title,
  subtitle,
  progress,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  progress: number;
}) {
  return (
    <header className="mt-4 mb-8">
      <ProgressBar value={progress} />
      <div className="mt-6 flex items-center gap-2 text-xs tracking-widest uppercase text-muted">
        {eyebrow}
      </div>
      <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-muted text-[15px] leading-relaxed">
          {subtitle}
        </p>
      )}
    </header>
  );
}
