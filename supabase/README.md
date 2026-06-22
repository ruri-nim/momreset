# Daily OK Supabase Setup

This folder contains the first server-backed data structure for Daily OK.

## What this schema covers

- user profile / goal settings
- food logs
- exercise logs
- habit templates
- daily habit results
- weight logs
- widget snapshot summary

## Current product note

The current web app still uses localStorage and NextAuth in production.

This Supabase structure is the next data layer for:

- web sync
- mobile app sync
- future iPhone widget data

## Setup order

1. Create a new Supabase project
2. Open the SQL editor
3. Run the migration in `supabase/migrations/20260622_dailyok_initial.sql`
4. Copy your project URL and publishable key
5. Add env vars to:
   - root `.env.local`
   - Vercel env vars
   - `mobile/.env`

## Required env vars

### Web

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Mobile

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Next step after this scaffold

1. Migrate auth to Supabase Auth or bridge current auth server-side
2. Replace localStorage writes with Supabase writes
3. Build widget summary sync from `widget_snapshots`
