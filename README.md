# Cosplay Hunt — spot-the-cosplay bingo

A small webapp for running a "Cosplay Hunt" bingo challenge at conventions.
Attendees log the character they're cosplaying and play a bingo card of
characters expected at the con. Admins create conventions, add characters
(with reference photos), and build bingo cards.

Stack: **Next.js (App Router)** + **Supabase** (Postgres, Auth, Storage) +
**Tailwind CSS**, deployable to **Vercel**.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL editor, paste and run the contents of `supabase/schema.sql`.
   This creates the tables, locks them down with row-level security, and
   sets up the public `character-images` storage bucket.
3. Under **Project Settings → API**, copy your **Project URL** and
   **anon public key**.
4. Under **Authentication → Users**, click **Add user** to create your
   first Admin login (email + password). Anyone with a login here is an
   Admin — there's no separate role flag, so only invite people you trust.

## 2. Configure the app

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with
the values from step 1.

## 3. Run it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the public site, and
`http://localhost:3000/admin` to sign in and manage conventions.

## 4. Deploy

Push this to a GitHub repo and import it into
[Vercel](https://vercel.com/new). Add the same two environment variables
in the Vercel project settings, then deploy. The free tier is plenty for
convention-scale traffic.

## How it's organized

```
app/
  page.js                        Home — list of conventions
  c/[conventionId]/page.js       Convention page — submission form + card links
  c/[conventionId]/bingo/[cardId]/page.js   The bingo card itself
  admin/login/page.js            Admin sign-in
  admin/page.js                  Admin dashboard — create/list conventions
  admin/conventions/[id]/page.js Manage one convention's characters, cards, submissions
lib/
  supabaseClient.js              Browser Supabase client
  supabaseServer.js              Server Component Supabase client
  useAdminSession.js             Hook that gates admin pages behind login
supabase/
  schema.sql                     Tables, RLS policies, storage bucket
```

## Notes on the current scope

- **Bingo progress is local-only.** A visitor's tapped/"spotted" squares
  are saved in their browser's `localStorage`, not the database. There's
  no visitor accounts, and no server-side tracking of who's found what —
  matches what was asked for "for now." If you later want a leaderboard
  or synced progress across devices, that would mean adding a
  `bingo_progress` table and either visitor accounts or a per-card share
  code.
- **Every Supabase Auth user is an Admin.** Simple and fine for a small
  trusted group; if the group grows, consider adding a `profiles` table
  with a `role` column and checking that in the RLS policies instead of
  just `auth.role() = 'authenticated'`.
- **Bingo cards are built from a dropdown per square**, with a "Shuffle
  from characters" button to auto-fill randomly and then hand-adjust.
