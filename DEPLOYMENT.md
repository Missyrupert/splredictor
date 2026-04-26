# Deployment Guide — Top 6 Prediction League

## Overview

The app is a Next.js 15 project. Storage uses Vercel Postgres (Neon-compatible).
All predictions, results, and settings persist in a hosted Postgres database.
There are no local files in production.

---

## Step 1 — Push code to GitHub

Your code is already at:
https://github.com/Missyrupert/splredictor

---

## Step 2 — Create a Vercel project

1. Go to https://vercel.com and sign in (or sign up free).
2. Click **Add New → Project**.
3. Select **Import Git Repository** and choose `Missyrupert/splredictor`.
4. Leave all build settings at their defaults — Vercel detects Next.js automatically.
   - Framework: **Next.js**
   - Build command: `next build`
   - Output directory: `.next`
5. Click **Deploy**.

The first deploy will fail at runtime if the database is not yet connected — that is expected. Do step 3 first.

---

## Step 3 — Add a Postgres database

### Option A — Vercel Postgres (recommended, one click)

1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database → Postgres**.
3. Give it a name (e.g. `splredictor-db`) and click **Create**.
4. Vercel automatically adds the required environment variables to your project:
   - `POSTGRES_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### Option B — Neon (free tier, external)

1. Go to https://neon.tech and create a free project.
2. Copy the connection string (it looks like `postgresql://user:pass@host/db?sslmode=require`).
3. In Vercel → your project → **Settings → Environment Variables**, add:
   - `POSTGRES_URL` = your Neon connection string

---

## Step 4 — Redeploy

After connecting the database:

1. Go to **Deployments** in your Vercel project.
2. Click the three-dot menu on the latest deployment → **Redeploy**.

Or trigger a new deploy by pushing any commit to `main`.

Tables (`predictions`, `results`, `settings`) are created automatically on the
first request — no migrations to run manually.

---

## Step 5 — Open the app

Your live URL will be something like:
```
https://splredictor.vercel.app
```

---

## Local development with the hosted database

To run the app locally against the real Vercel Postgres database:

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Link your local project:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

This connects your local app to the live database — any predictions entered locally
will appear in the deployed app and vice versa.

---

## Environment variables

| Variable | Where it comes from | Required |
|---|---|---|
| `POSTGRES_URL` | Vercel Storage tab (auto) or Neon dashboard | ✅ Yes |
| `POSTGRES_URL_NON_POOLING` | Vercel Storage tab (auto) | Optional |
| `POSTGRES_USER` | Vercel Storage tab (auto) | Optional |
| `POSTGRES_HOST` | Vercel Storage tab (auto) | Optional |
| `POSTGRES_PASSWORD` | Vercel Storage tab (auto) | Optional |
| `POSTGRES_DATABASE` | Vercel Storage tab (auto) | Optional |

No API keys. No other secrets needed.

---

## Will predictions persist after deployment?

**Yes.** All data is stored in Postgres, not on the server filesystem.
Vercel's serverless functions are stateless but the database is not.
A prediction saved by Rog in Edinburgh persists for CJ in Glasgow.

---

## Database tables (created automatically)

```sql
-- Stores each player's predicted score per fixture
CREATE TABLE predictions (
  user_name             TEXT    NOT NULL,
  fixture_id            TEXT    NOT NULL,
  predicted_home_score  INTEGER NOT NULL,
  predicted_away_score  INTEGER NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_name, fixture_id)
);

-- Stores actual final scores entered by admin (CJ)
CREATE TABLE results (
  fixture_id  TEXT    PRIMARY KEY,
  home        INTEGER NOT NULL,
  away        INTEGER NOT NULL,
  saved_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Stores app settings (active round)
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```
