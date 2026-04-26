import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  // 1. Check env var first — most common cause of failure
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({
      connected: false,
      error: 'POSTGRES_URL environment variable is not set. Go to Vercel → Storage → connect a Postgres database, then redeploy.',
      predictions: 0,
      results: 0,
      activeRound: null,
      predictionRows: [],
      resultRows: [],
    });
  }

  try {
    // Ensure tables exist before querying
    await sql`
      CREATE TABLE IF NOT EXISTS predictions (
        user_name TEXT NOT NULL, fixture_id TEXT NOT NULL,
        predicted_home_score INTEGER NOT NULL, predicted_away_score INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_name, fixture_id)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS results (
        fixture_id TEXT PRIMARY KEY, home INTEGER NOT NULL, away INTEGER NOT NULL,
        saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY, value TEXT NOT NULL
      )
    `;

    const [preds, results, setting] = await Promise.all([
      sql`SELECT user_name, fixture_id, predicted_home_score, predicted_away_score FROM predictions ORDER BY user_name, fixture_id`,
      sql`SELECT fixture_id, home, away FROM results ORDER BY fixture_id`,
      sql`SELECT value FROM settings WHERE key = 'activeRound'`,
    ]);

    return NextResponse.json({
      connected: true,
      error: null,
      predictions: preds.rowCount,
      results: results.rowCount,
      activeRound: setting.rows[0]?.value ?? '34 (default — not yet saved)',
      predictionRows: preds.rows,
      resultRows: results.rows,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown database error',
      predictions: 0,
      results: 0,
      activeRound: null,
      predictionRows: [],
      resultRows: [],
    });
  }
}
