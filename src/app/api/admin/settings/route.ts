import { NextRequest, NextResponse } from 'next/server';
import { saveSettings } from '@/lib/db';
import { FIXTURES } from '@/lib/fixtures';

const VALID_ROUNDS = [...new Set(FIXTURES.map((f) => f.roundNumber))];

// POST /api/admin/settings
// Body: { activeRound: number }
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { activeRound } = body as Record<string, unknown>;

  if (typeof activeRound !== 'number' || !VALID_ROUNDS.includes(activeRound)) {
    return NextResponse.json(
      { error: `activeRound must be one of: ${VALID_ROUNDS.join(', ')}` },
      { status: 400 },
    );
  }

  await saveSettings({ activeRound });
  return NextResponse.json({ ok: true, activeRound });
}
