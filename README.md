# SheLeads Studios — profile-building prototype

A mobile-first web prototype of the athlete-side experience: swipe-driven
profile building, fake social scan, optional hype-squad testimonials, and an
AI-feeling match reveal with local Belgian brands.

Stack: Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · Framer Motion ·
Supabase (auth + Postgres) · Vercel.

## 1. Create a Supabase project

1. Go to https://supabase.com, sign up (free), and create a new project.
   - Pick any name. Region: EU West (Frankfurt) recommended.
   - Copy your DB password somewhere — you won't need it for the prototype but
     you need it to recover later.
2. In the project dashboard, go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key

## 2. Configure environment

```bash
cp .env.local.example .env.local
```

Open `.env.local` and paste in the two values from Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Apply the schema + seed data

In the Supabase dashboard, open **SQL Editor → New query**, paste the full
contents of each migration in order, and run:

1. `supabase/migrations/0001_init.sql` — tables, RLS policies, and the two
   public RPCs used by the fan-invite flow.
2. `supabase/migrations/0002_seed.sql` — 10 psychographic statements, 16
   athletes, and 16 local Belgian brands.

## 4. Configure Supabase auth

In the Supabase dashboard:

- **Authentication → Providers → Email** — ensure it's enabled, and turn
  **"Confirm email"** OFF for the prototype so magic links work fast.
- **Authentication → URL Configuration** — add your dev URL
  (`http://localhost:3000`) to the allowed redirect URLs. When you deploy to
  Vercel, also add the Vercel preview + production URLs.

## 5. Run the app

```bash
npm run dev
```

Open http://localhost:3000. Full flow:

1. Landing → **Build my profile**
2. Login with magic link → check your inbox
3. `identity` → `values` → `athletes` → `brands` → `social` → `sociodemo`
4. Optional `fans` step (up to 3 invite links)
5. `/matches` — the reveal, with your hype-squad row

Fan invite links look like `http://localhost:3000/fan/<token>`. Open one in a
private window to submit a testimonial; it shows up live on the athlete's
matches page.

## 6. Deploy

```bash
vercel
```

In the Vercel dashboard, add the three env vars from `.env.local` — and set
`NEXT_PUBLIC_SITE_URL` to the final production URL. Re-add the Vercel URLs to
Supabase's allowed redirect list.

## What's in the box

```
app/
  page.tsx                    Landing
  login/page.tsx              Magic-link login
  auth/callback/route.ts      OAuth code exchange
  onboarding/
    identity/ values/ athletes/ brands/ social/ sociodemo/ fans/
  matches/page.tsx            Reveal (brand matches + hype squad)
  fan/[token]/page.tsx        Public testimonial form
components/
  SwipeDeck.tsx               Reusable across values/athletes/brands
  ProgressBar, StepHeader, ChipPicker, ScanAnimation,
  MatchCard, FanInviteCard, HypeSquadRow
lib/
  supabase/{client,server,middleware}.ts
  onboarding/steps.ts         Step order + progress %
  matching/score.ts           Weighted Jaccard + sport/audience blend
  stub/fakeScan.ts            Deterministic fake social metrics
supabase/migrations/          Schema, RLS, RPCs, seed
```

## Scope notes

Intentionally out-of-scope for the prototype: real social-media scraping, the
brand-side flow, the AI personal-branding paid tier, commissioning/payment
plumbing, push notifications, and an offline-capable PWA.
