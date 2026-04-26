export interface Fixture {
  id: string;
  roundNumber: number;
  homeTeam: string;
  awayTeam: string;
  kickoff: string; // ISO 8601 with BST offset
  venue: string;
}

export type FixtureStatus = 'upcoming' | 'completed' | 'live';

export interface FixtureWithStatus extends Fixture {
  status: FixtureStatus;
  actualHomeScore: number | null;
  actualAwayScore: number | null;
}

export interface Prediction {
  predictedHomeScore: number;
  predictedAwayScore: number;
  createdAt: string;
  updatedAt: string;
}

// data/predictions.json shape:  { [userName]: { [fixtureId]: Prediction } }
export type AllPredictions = Record<string, Record<string, Prediction>>;

// data/results.json shape:  { [fixtureId]: { home: number; away: number; savedAt: string } }
export interface StoredResult {
  home: number;
  away: number;
  savedAt: string;
}
export type AllResults = Record<string, StoredResult>;

export interface LeaderboardEntry {
  userName: string;
  totalPoints: number;
  exactScores: number;
  correctResults: number;
  predictionsMade: number;
  rank: number;
}

export const PLAYERS = ['Jase', 'Eug', 'Ebbsy', 'CJ'] as const;
export type PlayerName = (typeof PLAYERS)[number];
