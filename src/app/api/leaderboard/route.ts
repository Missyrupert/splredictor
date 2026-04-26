import { NextResponse } from 'next/server';
import { readPredictions, readResults } from '@/lib/db';
import { calculateLeaderboard } from '@/lib/scoring';

export async function GET() {
  const [predictions, results] = await Promise.all([readPredictions(), readResults()]);
  const leaderboard = calculateLeaderboard(predictions, results);
  return NextResponse.json(leaderboard);
}
