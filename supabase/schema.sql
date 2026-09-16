-- Run this once in your Supabase project's SQL editor.
-- It creates the tables, locks them down with row-level security,
-- and sets up a public storage bucket for character images.

create extension if not exists "pgcrypto";

-- ── Tables ──────────────────────────────────────────────────────────

create table if not exists conventions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  theme text,
  logo_url text,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  times text,
  venue text,
  address text
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  convention_id uuid not null references conventions(id) on delete cascade,
  name text not null,
  contact text not null,
  app_uid text not null,
  code text not null,
  character text not null,
  series text not null,
  description text not null,
  image_url text,
  invisible boolean,
  next_reset timestamptz not null default now(),
  score int not null,
  targets text,
  approved int not null,
  created_at timestamptz not null default now()
);

create table if not exists captures (
  id uuid primary key default gen_random_uuid(),
  convention_id uuid not null references conventions(id) on delete cascade,
  hunter_id uuid not null references players(id) on delete cascade,
  target_id uuid not null references players(id),
  capture_time timestamptz not null default now(),
  score int not null
);

-- ── Row Level Security ──────────────────────────────────────────────
-- Public visitors (the "anon" role) may read convention/character/card
-- data, submit a cosplay entry, and edit their own entry's details —
-- but they can never touch the "approved" column, no matter what they
-- send in the payload (enforced at the column-grant level below, not
-- just by policy, so it fails hard rather than silently).
--
-- Only logged-in Admins (any row in Supabase Auth counts as an Admin
-- here — invite trusted people only) may create/edit/delete
-- conventions, approve/reject characters, or delete cards.

alter table conventions enable row level security;
alter table players enable row level security;

drop policy if exists "conventions are publicly readable" on conventions;
drop policy if exists "admins manage conventions" on conventions;
drop policy if exists "characters are publicly readable" on players;
drop policy if exists "anyone can submit a character" on players;
drop policy if exists "anyone can update characters" on players;
drop policy if exists "admins delete characters" on players;

-- conventions: admin-only writes
create policy "conventions are publicly readable"
  on conventions for select using (true);
create policy "admins manage conventions"
  on conventions for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- players: readable by everyone
create policy "characters are publicly readable"
  on players for select using (true);

-- players: anyone (including anon) can create a submission
-- but column grants below stop anon from ever writing "approved"
create policy "anyone can submit a character"
  on players for insert to anon with check (
  approved = 0
);
-- players: anyone (including anon) can update a row —
create policy "anyone can update characters"
  on players for update to anon with check (
  approved = 0
);

create policy "admins manage characters"
  on players for all using (auth.role() = 'authenticated');
  
-- ── Column-level privileges ───────────────────────────────────────
-- RLS controls *which rows*, this controls *which columns*.
-- Postgres checks column grants before RLS policies are evaluated,
-- so this is what actually keeps anon away from "approved".

revoke update on players from anon, authenticated;

grant update (
  name, contact, character, series, description, image_url,
  invisible, next_reset, score, targets
) on players to anon, authenticated;

-- only authenticated may additionally write "approved"
grant update (approved) on players to authenticated;

-- Approved field should always be 0 for new players
alter table players
alter column approved set default 0;

-- ── Storage (character images) ──────────────────────────────────────
-- Create a public bucket for character photos. Run this section, or
-- create the "character-images" bucket by hand in Storage > New Bucket
-- with "Public bucket" turned on.

insert into storage.buckets (id, name, public)
values ('hunter-photos', 'hunter-photos', true)
on conflict (id) do nothing;

create policy "hunter images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'hunter-photos');

-- create policy "admins upload character images"
--   on storage.objects for insert with check (true)
--   using (bucket_id = 'character-images');

-- ── How to create your first Admin ──────────────────────────────────
-- In the Supabase dashboard: Authentication > Users > Add user.
-- Any confirmed user in this project can log in at /admin/login and
-- gets full Admin rights (see the policies above). Keep this list to
-- people you trust — there's no separate "admin" flag, being a
-- registered user *is* being an Admin.