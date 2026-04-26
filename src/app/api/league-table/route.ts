import { NextResponse } from 'next/server';
import { readResults } from '@/lib/db';
import { calculateTable } from '@/lib/league-table';

export async function GET() {
  const results = await readResults();
  const table = calculateTable(results);
  return NextResponse.json(table);
}
