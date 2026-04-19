import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col px-5 pt-5 pb-8">
        <Link
          href="/"
          aria-label="Exit onboarding"
          className="inline-flex items-center gap-1 text-muted-2 text-xs hover:text-foreground transition-colors self-start"
        >
          <ArrowLeft className="size-3.5" /> Exit
        </Link>
        {children}
      </div>
    </main>
  );
}
