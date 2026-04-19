-- SheLeads Studios: athlete profile schema

set check_function_bodies = off;

-- ============================================================================
-- Profiles (1 row per authenticated user)
-- ============================================================================
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  city text,
  country text default 'BE',
  dob date,
  languages text[] default '{}'::text[],
  audience_demographics jsonb default '{}'::jsonb,
  completion_pct int default 0 check (completion_pct between 0 and 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
create policy "profiles_owner_select" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_owner_update" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_owner_insert" on public.profiles
  for insert with check (auth.uid() = user_id);

-- ============================================================================
-- Athlete sports (multi-row: athlete may list several)
-- ============================================================================
create table public.athlete_sports (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  sport text not null,
  level text,              -- hobby | club | regional | national | international
  frequency text,          -- weekly sessions or hours
  achievement text,
  ambition text,
  created_at timestamptz default now()
);
create index athlete_sports_user_idx on public.athlete_sports(user_id);

alter table public.athlete_sports enable row level security;
create policy "athlete_sports_owner_all" on public.athlete_sports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Value responses (psychographic swipes)
-- ============================================================================
create table public.value_responses (
  user_id uuid not null references auth.users(id) on delete cascade,
  statement_id int not null,
  response text not null check (response in ('agree','disagree','skip')),
  created_at timestamptz default now(),
  primary key (user_id, statement_id)
);
alter table public.value_responses enable row level security;
create policy "value_responses_owner_all" on public.value_responses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Swipes (athletes + brands)
-- ============================================================================
create table public.swipes (
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('athlete','brand')),
  target_id int not null,
  direction text not null check (direction in ('like','dislike')),
  created_at timestamptz default now(),
  primary key (user_id, target_type, target_id)
);
alter table public.swipes enable row level security;
create policy "swipes_owner_all" on public.swipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Social handles + fake scan result
-- ============================================================================
create table public.social_handles (
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('instagram','tiktok','youtube')),
  handle text not null,
  scan_result jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  primary key (user_id, platform)
);
alter table public.social_handles enable row level security;
create policy "social_handles_owner_all" on public.social_handles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Seed data (public read)
-- ============================================================================
create table public.seed_statements (
  id int primary key,
  text text not null,
  tag text not null
);
create table public.seed_athletes (
  id int primary key,
  name text not null,
  sport text not null,
  tagline text,
  photo_url text,
  tags text[] default '{}'::text[]
);
create table public.seed_brands (
  id int primary key,
  name text not null,
  category text not null,
  photo_url text,
  tagline text,
  values_tags text[] default '{}'::text[],
  audience_fit text[] default '{}'::text[],
  sport_affinity text[] default '{}'::text[],
  size text,                     -- micro | small | mid
  city text
);

alter table public.seed_statements enable row level security;
alter table public.seed_athletes enable row level security;
alter table public.seed_brands enable row level security;
create policy "seed_statements_read" on public.seed_statements for select using (true);
create policy "seed_athletes_read" on public.seed_athletes for select using (true);
create policy "seed_brands_read" on public.seed_brands for select using (true);

-- ============================================================================
-- Matches (written on reveal)
-- ============================================================================
create table public.matches (
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id int not null references public.seed_brands(id) on delete cascade,
  score numeric not null,
  reason_tags text[] default '{}'::text[],
  created_at timestamptz default now(),
  primary key (user_id, brand_id)
);
alter table public.matches enable row level security;
create policy "matches_owner_all" on public.matches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- Fan testimonials (optional step, has public write via RPC)
-- ============================================================================
create table public.fan_testimonials (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  fan_name_suggested text not null,
  relationship text,
  invite_token text not null unique,
  status text not null default 'pending' check (status in ('pending','completed')),
  testimonial text,
  fan_name_actual text,
  fan_relationship_actual text,
  created_at timestamptz default now(),
  completed_at timestamptz
);
create index fan_testimonials_user_idx on public.fan_testimonials(user_id);

alter table public.fan_testimonials enable row level security;
create policy "fan_testimonials_owner_all" on public.fan_testimonials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public read by token (limited shape) via RPC below.
-- Public write via SECURITY DEFINER RPC — no direct table access.

create or replace function public.get_fan_invite(p_token text)
returns table(
  athlete_name text,
  fan_name_suggested text,
  status text
)
language sql
security definer
set search_path = public
as $$
  select p.display_name, ft.fan_name_suggested, ft.status
  from public.fan_testimonials ft
  join public.profiles p on p.user_id = ft.user_id
  where ft.invite_token = p_token
  limit 1;
$$;

create or replace function public.submit_fan_testimonial(
  p_token text,
  p_testimonial text,
  p_fan_name text,
  p_relationship text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows int;
begin
  if length(coalesce(p_testimonial,'')) < 3 or length(p_testimonial) > 600 then
    raise exception 'Testimonial must be between 3 and 600 characters';
  end if;

  update public.fan_testimonials
     set status = 'completed',
         testimonial = p_testimonial,
         fan_name_actual = nullif(p_fan_name, ''),
         fan_relationship_actual = nullif(p_relationship, ''),
         completed_at = now()
   where invite_token = p_token
     and status = 'pending';

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

-- Allow anonymous execution of the two RPCs
grant execute on function public.get_fan_invite(text) to anon, authenticated;
grant execute on function public.submit_fan_testimonial(text, text, text, text) to anon, authenticated;
