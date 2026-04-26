import { sql } from '@vercel/postgres';
import type { AllPredictions, AllResults } from '@/types';

export interface AppSettings {
  activeRound: number;
}

const DEFAULT_SETTINGS: AppSettings = { activeRound: 34 };

// ── Table bootstrap ────────────────────────────────────────────────────────
// Runs CREATE TABLE IF NOT EXISTS on every cold start (idempotent).

let ready = false;

async function ensureTables(): Promise<void> {
  if (ready) return;

  await sql`
    CREATE TABLE IF NOT EXISTS predictions (
      user_name             TEXT    NOT NULL,
      fixture_id            TEXT    NOT NULL,
      predicted_home_score  INTEGER NOT NULL,
      predicted_away_score  INTEGER NOT NULL,
      created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_name, fixture_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS results (
      fixture_id  TEXT    PRIMARY KEY,
      home        INTEGER NOT NULL,
      away        INTEGER NOT NULL,
      saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;

  ready = true;
}

// ── Predictions ────────────────────────────────────────────────────────────

export async function readPredictions(): Promise<AllPredictions> {
  await ensureTables();

  const { rows } = await sql`
    SELECT user_name, fixture_id, predicted_home_score, predicted_away_score,
           created_at, updated_at
    FROM   predictions
  `;

  const out: AllPredictions = {};
  for (const r of rows) {
    if (!out[r.user_name]) out[r.user_name] = {};
    out[r.user_name][r.fixture_id] = {
      predictedHomeScore: r.predicted_home_score,
      predictedAwayScore: r.predicted_away_score,
      createdAt:  r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updatedAt:  r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  }
  return out;
}

export async function writePredictions(data: AllPredictions): Promise<void> {
  await ensureTables();

  for (const [userName, fixtures] of Object.entries(data)) {
    for (const [fixtureId, pred] of Object.entries(fixtures)) {
      await sql`
        INSERT INTO predictions
          (user_name, fixture_id, predicted_home_score, predicted_away_score, created_at, updated_at)
        VALUES
          (${userName}, ${fixtureId}, ${pred.predictedHomeScore}, ${pred.predictedAwayScore},
           ${pred.createdAt}, ${pred.updatedAt})
        ON CONFLICT (user_name, fixture_id) DO UPDATE SET
          predicted_home_score = EXCLUDED.predicted_home_score,
          predicted_away_score = EXCLUDED.predicted_away_score,
          updated_at           = EXCLUDED.updated_at
      `;
    }
  }
}

export async function savePrediction(
  userName: string,
  fixtureId: string,
  home: number,
  away: number,
): Promise<void> {
  await ensureTables();

  await sql`
    INSERT INTO predictions
      (user_name, fixture_id, predicted_home_score, predicted_away_score, created_at, updated_at)
    VALUES
      (${userName}, ${fixtureId}, ${home}, ${away}, NOW(), NOW())
    ON CONFLICT (user_name, fixture_id) DO UPDATE SET
      predicted_home_score = EXCLUDED.predicted_home_score,
      predicted_away_score = EXCLUDED.predicted_away_score,
      updated_at           = NOW()
  `;
}

// ── Results ────────────────────────────────────────────────────────────────

export async function readResults(): Promise<AllResults> {
  await ensureTables();

  const { rows } = await sql`
    SELECT fixture_id, home, away, saved_at FROM results
  `;

  const out: AllResults = {};
  for (const r of rows) {
    out[r.fixture_id] = {
      home:    r.home,
      away:    r.away,
      savedAt: r.saved_at instanceof Date ? r.saved_at.toISOString() : String(r.saved_at),
    };
  }
  return out;
}

export async function saveResult(
  fixtureId: string,
  home: number,
  away: number,
): Promise<void> {
  await ensureTables();

  await sql`
    INSERT INTO results (fixture_id, home, away, saved_at)
    VALUES (${fixtureId}, ${home}, ${away}, NOW())
    ON CONFLICT (fixture_id) DO UPDATE SET
      home     = EXCLUDED.home,
      away     = EXCLUDED.away,
      saved_at = NOW()
  `;
}

export async function deleteResult(fixtureId: string): Promise<void> {
  await ensureTables();
  await sql`DELETE FROM results WHERE fixture_id = ${fixtureId}`;
}

// ── Settings ───────────────────────────────────────────────────────────────

export async function readSettings(): Promise<AppSettings> {
  await ensureTables();

  const { rows } = await sql`
    SELECT value FROM settings WHERE key = 'activeRound'
  `;

  if (rows.length === 0) return DEFAULT_SETTINGS;

  const parsed = parseInt(rows[0].value, 10);
  return { activeRound: isNaN(parsed) ? DEFAULT_SETTINGS.activeRound : parsed };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await ensureTables();

  await sql`
    INSERT INTO settings (key, value)
    VALUES ('activeRound', ${String(settings.activeRound)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
}
