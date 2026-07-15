-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Creates the players table for Hoodie Drop

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  privy_user_id text unique not null,
  x_username text not null,
  wallet_address text not null,
  best_score integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists players_best_score_idx on players (best_score desc);

-- Row Level Security: lock the table down. All reads/writes for this app
-- go through the server (service role key), which bypasses RLS, so the
-- table stays private from direct client access.
alter table players enable row level security;
