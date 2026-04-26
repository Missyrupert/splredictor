import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Round 34 predictions collected before the Celtic v Falkirk kickoff.
// fixture "1"  = Celtic v Falkirk  (25 Apr, 17:30)
// fixture "2"  = Hibernian v Hearts (26 Apr, 16:30)
// fixture "13" = Rangers v Motherwell (26 Apr, 15:00)

const ROUND_34_PREDICTIONS = [
  // CJ entered all three Round 34 fixtures before kickoff
  { userName: 'CJ',    fixtureId: '1',  home: 3, away: 1, ts: '2026-04-25T13:47:21Z' },
  { userName: 'CJ',    fixtureId: '2',  home: 3, away: 2, ts: '2026-04-25T14:40:39Z' },
  { userName: 'CJ',    fixtureId: '13', home: 1, away: 2, ts: '2026-04-25T14:41:06Z' },
  // Friends' Celtic v Falkirk predictions (entered retrospectively before kickoff)
  { userName: 'Jase',  fixtureId: '1',  home: 4, away: 1, ts: '2026-04-25T17:25:00Z' },
  { userName: 'Ebbsy', fixtureId: '1',  home: 1, away: 1, ts: '2026-04-25T17:25:00Z' },
  { userName: 'Eug',   fixtureId: '1',  home: 3, away: 1, ts: '2026-04-25T17:25:00Z' },
];

export async function POST() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ ok: false, error: 'POSTGRES_URL not set' }, { status: 500 });
  }

  try {
    let inserted = 0;
    let skipped = 0;

    for (const p of ROUND_34_PREDICTIONS) {
      const result = await sql`
        INSERT INTO predictions
          (user_name, fixture_id, predicted_home_score, predicted_away_score, created_at, updated_at)
        VALUES
          (${p.userName}, ${p.fixtureId}, ${p.home}, ${p.away}, ${p.ts}, ${p.ts})
        ON CONFLICT (user_name, fixture_id) DO NOTHING
      `;
      if ((result.rowCount ?? 0) > 0) inserted++;
      else skipped++;
    }

    // Ensure active round is set to 34 if not already configured
    await sql`
      INSERT INTO settings (key, value) VALUES ('activeRound', '34')
      ON CONFLICT (key) DO NOTHING
    `;

    return NextResponse.json({
      ok: true,
      inserted,
      skipped,
      message: `${inserted} predictions inserted, ${skipped} already existed`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
