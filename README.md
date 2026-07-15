# Hoodie Drop

A browser-based catcher game with X-login and wallet-linked, on-chain-adjacent scoring.
Catch coins, dodge rug bags, climb the ledger.

## Stack
- Next.js 16 (App Router)
- Privy (log in with X → auto-provisioned embedded wallet)
- Supabase (Postgres) for the players table

## Setup (from scratch, phone-friendly)

### 1. Privy
1. Go to https://dashboard.privy.io and create an app.
2. Under **Login methods**, enable **Twitter / X**.
3. Under **Embedded wallets**, set "Create on login" to cover users without wallets (already configured in code as `users-without-wallets`, Ethereum).
4. Copy your **App ID** and **App Secret** (Settings tab).

### 2. Supabase
1. Go to https://supabase.com, create a free project.
2. Open **SQL Editor** → paste the contents of `supabase-schema.sql` → Run.
3. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this one server-only, never expose to client)

### 3. Environment variables
Copy `.env.local.example` to `.env.local` and fill in the 5 values from steps 1–2.

On Vercel, add the same 5 variables under **Project → Settings → Environment Variables**.

### 4. Deploy
1. Push this project to a GitHub repo (GitHub mobile web supports drag-and-drop file upload if you don't have git on your phone — create a new repo, then use "uploading an existing file").
2. Go to https://vercel.com → **Add New Project** → import the repo.
3. Paste in the 5 env vars.
4. Deploy.

## API

- `POST /api/score` — body `{ score, sessionDurationMs }`, requires `Authorization: Bearer <privy access token>`. Upserts best_score if improved. Identity comes from the verified Privy session, never the request body.
- `GET /api/leaderboard` — top 50 by best_score, descending.
- `GET /api/leaderboard/export` — same data as downloadable CSV.

## Security notes
- Score submissions are tied to the server-verified Privy session (`x_username` / `wallet_address` are read from Privy's own user record, not trusted from the client).
- `/api/score` is rate-limited (10 req/min per user) and rejects scores that are implausible for the reported session duration, or above an absolute cap.
- Supabase RLS is enabled with no public policies — the app only ever talks to Supabase through the server-side service role key.

## Local dev
```
npm install
npm run dev
```
