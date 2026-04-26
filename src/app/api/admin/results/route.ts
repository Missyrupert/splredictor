import { NextRequest, NextResponse } from 'next/server';
import { saveResult, deleteResult } from '@/lib/db';
import { FIXTURES } from '@/lib/fixtures';

const VALID_IDS = new Set(FIXTURES.map((f) => f.id));

// POST /api/admin/results
// Body: { fixtureId, home, away } — saves result and marks fixture completed
// Body: { fixtureId, delete: true } — removes result (marks upcoming)
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { fixtureId, home, away, delete: del } =
    body as Record<string, unknown>;

  if (typeof fixtureId !== 'string' || !VALID_IDS.has(fixtureId)) {
    return NextResponse.json({ error: 'Invalid fixtureId' }, { status: 400 });
  }

  if (del === true) {
    await deleteResult(fixtureId);
    return NextResponse.json({ ok: true, deleted: true });
  }

  if (
    typeof home !== 'number' || typeof away !== 'number' ||
    home < 0 || home > 20 || away < 0 || away > 20 ||
    !Number.isInteger(home) || !Number.isInteger(away)
  ) {
    return NextResponse.json({ error: 'Invalid scores' }, { status: 400 });
  }

  await saveResult(fixtureId, home, away);
  return NextResponse.json({ ok: true });
}
