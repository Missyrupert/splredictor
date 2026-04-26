import { NextRequest, NextResponse } from 'next/server';
import { readPredictions, savePrediction } from '@/lib/db';
import { PLAYERS } from '@/types';

// GET /api/predictions?userName=Rog
export async function GET(req: NextRequest) {
  const userName = req.nextUrl.searchParams.get('userName');
  if (!userName || !(PLAYERS as readonly string[]).includes(userName)) {
    return NextResponse.json({ error: 'Invalid userName' }, { status: 400 });
  }

  const all = await readPredictions();
  return NextResponse.json(all[userName] ?? {});
}

// POST /api/predictions
// Body: { userName, fixtureId, predictedHomeScore, predictedAwayScore }
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { userName, fixtureId, predictedHomeScore, predictedAwayScore } =
    body as Record<string, unknown>;

  if (
    typeof userName !== 'string' ||
    !(PLAYERS as readonly string[]).includes(userName) ||
    typeof fixtureId !== 'string' ||
    typeof predictedHomeScore !== 'number' ||
    typeof predictedAwayScore !== 'number' ||
    predictedHomeScore < 0 || predictedHomeScore > 20 ||
    predictedAwayScore < 0 || predictedAwayScore > 20
  ) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  await savePrediction(userName, fixtureId, predictedHomeScore, predictedAwayScore);
  return NextResponse.json({ ok: true });
}
