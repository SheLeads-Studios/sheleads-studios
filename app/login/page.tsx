"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !supabaseConfigured) return;
    setStatus("sending");
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/identity`,
        },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-10 pb-10 max-w-md mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted text-sm hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>

        <div className="mt-12">
          <h1 className="font-display text-4xl leading-tight tracking-tight">
            Let&apos;s save your progress.
          </h1>
          <p className="mt-3 text-muted">
            We&apos;ll send a magic link to your inbox. No password, no spam.
          </p>
        </div>

        {!supabaseConfigured && (
          <div className="mt-6 rounded-2xl border border-border-strong bg-surface p-4 text-sm text-muted">
            <strong className="text-foreground">Supabase not configured.</strong>{" "}
            Copy <code className="text-accent">.env.local.example</code> to{" "}
            <code className="text-accent">.env.local</code>, fill in your
            Supabase URL + anon key, and restart the dev server.
          </div>
        )}

        {status === "sent" ? (
          <div className="mt-10 flex flex-col items-center text-center gap-3 rounded-3xl bg-surface border border-border-strong p-8">
            <CheckCircle2 className="size-10 text-primary" />
            <div className="font-display text-2xl">Check your inbox</div>
            <p className="text-muted text-sm">
              We sent a magic link to <strong className="text-foreground">{email}</strong>.
              Tap it to keep building your profile.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Your email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@club.be"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!supabaseConfigured || status === "sending"}
              />
            </div>
            {error && (
              <p className="text-sm text-primary">{error}</p>
            )}
            <Button
              type="submit"
              size="lg"
              disabled={!supabaseConfigured || status === "sending"}
            >
              <Mail className="size-4" />
              {status === "sending" ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
