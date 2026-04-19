import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, MessageSquareHeart, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-16 pb-10 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 text-sm tracking-widest uppercase text-muted">
          <Sparkles className="size-4 text-primary" />
          SheLeads Studios
        </div>

        <h1 className="mt-8 font-display text-[44px] leading-[1.02] tracking-tight">
          Find sponsors who
          <br />
          <span className="text-primary italic">actually</span> get you.
        </h1>

        <p className="mt-5 text-muted text-lg leading-relaxed">
          A playful home for female athletes — build a profile, swipe the brands
          you love, and we&apos;ll match you with local sponsors who share your
          values.
        </p>

        <div className="mt-10 grid gap-3">
          <Feature
            icon={<Heart className="size-4 text-primary" />}
            title="Swipe-first profile"
            body="No long forms. Tell us your vibe in fun taps."
          />
          <Feature
            icon={<Users className="size-4 text-primary" />}
            title="Your hype squad"
            body="Invite three fans to hype you up — their words live on your profile."
          />
          <Feature
            icon={<MessageSquareHeart className="size-4 text-primary" />}
            title="Values-first matches"
            body="Local Belgian brands that align with what matters to you."
          />
        </div>

        <div className="mt-auto pt-14">
          <Link href="/login" className="block">
            <Button size="lg" className="w-full">
              Build my profile — 4 min
            </Button>
          </Link>
          <p className="mt-3 text-center text-xs text-muted-2">
            Free while in prototype · No pressure, skip any step
          </p>
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface border border-border p-4">
      <div className="mt-0.5 size-7 rounded-full bg-surface-2 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="font-medium text-foreground">{title}</div>
        <div className="text-sm text-muted">{body}</div>
      </div>
    </div>
  );
}
