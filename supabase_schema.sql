-- supabase_schema.sql
-- Database migrations for ViralFlow AI

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CREATORS TABLE (Syncs with auth.users)
create table public.creators (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'creator' check (role in ('creator', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  niche text,
  audience text,
  tone text[],
  vocabulary text[],
  preferred_duration integer default 45,
  brand_rules jsonb default '{}'::jsonb,
  auto_publish_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.creators enable row level security;

-- 2. TRENDS TABLE (Scanned trends from APIs)
create table public.trends (
  id uuid default uuid_generate_v4() primary key,
  source text not null check (source in ('youtube', 'rss', 'custom')),
  external_id text,
  title text not null,
  url text not null,
  published_at timestamp with time zone,
  views integer default 0,
  likes integer default 0,
  comments integer default 0,
  topic text,
  fetched_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.trends enable row level security;

-- 3. TREND SCORES TABLE (Creator-specific opportunity evaluation)
create table public.trend_scores (
  trend_id uuid references public.trends(id) on delete cascade,
  creator_id uuid references public.creators(id) on delete cascade,
  momentum integer not null check (momentum >= 0 and momentum <= 100),
  fit integer not null check (fit >= 0 and fit <= 100),
  novelty integer not null check (novelty >= 0 and novelty <= 100),
  saturation integer not null check (saturation >= 0 and saturation <= 100),
  feasibility integer not null check (feasibility >= 0 and feasibility <= 100),
  overall_score integer not null check (overall_score >= 0 and overall_score <= 100),
  reason text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  primary key (trend_id, creator_id)
);

-- Enable RLS
alter table public.trend_scores enable row level security;

-- 4. CONTENT IDEAS TABLE (Selected angles and hooks)
create table public.content_ideas (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.creators(id) on delete cascade,
  trend_id uuid references public.trends(id) on delete cascade,
  angle text not null,
  hook text not null,
  status text default 'draft' check (status in ('draft', 'scripting', 'rendering', 'ready', 'published')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.content_ideas enable row level security;

-- 5. SCRIPTS TABLE (Scene timelines and factchecks)
create table public.scripts (
  id uuid default uuid_generate_v4() primary key,
  content_id uuid references public.content_ideas(id) on delete cascade,
  script_json jsonb not null, -- Array of scene objects with timings, script text, and B-roll parameters
  claims_json jsonb,          -- Extracted claims details for review
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.scripts enable row level security;

-- 6. CREATOR DNA VERSIONS TABLE (Tracks historical profile shifts)
create table public.creator_dna_versions (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.creators(id) on delete cascade,
  version integer default 1,
  profile_json jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.creator_dna_versions enable row level security;


-- =======================================================
-- AUTOMATIC CREATOR REGISTRATION (Sync Trigger)
-- =======================================================

-- Create trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.creators (id, email, role, status)
  values (new.id, new.email, 'creator', 'active');
  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger to auth.users table
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================

-- Creators Policy (Read/Update their own profile)
create policy "Creators can view their own profile" on public.creators
  for select using (auth.uid() = id);

create policy "Creators can update their own profile" on public.creators
  for update using (auth.uid() = id);

create policy "Admins can do everything on creators" on public.creators
  for all using (
    exists (
      select 1 from public.creators
      where id = auth.uid() and role = 'admin'
    )
  );

-- Trends Policy (All authenticated users can view trends)
create policy "Authenticated users can read trends" on public.trends
  for select using (auth.role() = 'authenticated');

create policy "Admins/Orchestrators can write trends" on public.trends
  for all using (
    exists (
      select 1 from public.creators
      where id = auth.uid() and role = 'admin'
    )
  );

-- Trend Scores Policy (Creators view scores linked to them)
create policy "Creators can read their scores" on public.trend_scores
  for select using (auth.uid() = creator_id);

create policy "Admins can manage trend scores" on public.trend_scores
  for all using (
    exists (
      select 1 from public.creators
      where id = auth.uid() and role = 'admin'
    )
  );

-- Content Ideas Policy (Creators manage their ideas)
create policy "Creators can manage their own content ideas" on public.content_ideas
  for all using (auth.uid() = creator_id);

create policy "Admins can manage all content ideas" on public.content_ideas
  for all using (
    exists (
      select 1 from public.creators
      where id = auth.uid() and role = 'admin'
    )
  );

-- Scripts Policy (Creators view their scripts)
create policy "Creators can manage their scripts" on public.scripts
  for all using (
    exists (
      select 1 from public.content_ideas
      where id = content_id and creator_id = auth.uid()
    )
  );

create policy "Admins can manage all scripts" on public.scripts
  for all using (
    exists (
      select 1 from public.creators
      where id = auth.uid() and role = 'admin'
    )
  );

-- Creator DNA versions Policy (Creators view their history)
create policy "Creators can view their DNA history" on public.creator_dna_versions
  for select using (auth.uid() = creator_id);

create policy "Admins can manage all DNA histories" on public.creator_dna_versions
  for all using (
    exists (
      select 1 from public.creators
      where id = auth.uid() and role = 'admin'
    )
  );
