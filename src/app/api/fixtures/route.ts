import { NextResponse } from 'next/server';
import { FIXTURES } from '@/lib/fixtures';
import { readResults } from '@/lib/db';
import type { FixtureWithStatus } from '@/types';

export async function GET() {
  const results = await readResults();

  const fixtures: FixtureWithStatus[] = FIXTURES.map((f) => {
    const result = results[f.id];
    return {
      ...f,
      status: result ? 'completed' : 'upcoming',
      actualHomeScore: result?.home ?? null,
      actualAwayScore: result?.away ?? null,
    };
  });

  return NextResponse.json(fixtures);
}
