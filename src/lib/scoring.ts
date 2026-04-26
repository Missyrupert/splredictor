import type { AllPredictions, AllResults, LeaderboardEntry } from '@/types';
import { PLAYERS } from '@/types';

type Outcome = 'H' | 'D' | 'A';

function outcome(home: number, away: number): Outcome {
  if (home > away) return 'H';
  if (home < away) return 'A';
  return 'D';
}

export function scoreOnePrediction(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
): { points: number; type: 'exact' | 'result' | 'miss' } {
  if (predHome === actualHome && predAway === actualAway) {
    return { points: 3, type: 'exact' };
  }
  if (outcome(predHome, predAway) === outcome(actualHome, actualAway)) {
    return { points: 1, type: 'result' };
  }
  return { points: 0, type: 'miss' };
}

export function calculateLeaderboard(
  predictions: AllPredictions,
  results: AllResults,
): LeaderboardEntry[] {
  const entries = PLAYERS.map((userName) => {
    const userPreds = predictions[userName] ?? {};
    let totalPoints = 0;
    let exactScores = 0;
    let correctResults = 0;
    let predictionsMade = 0;

    for (const [fixtureId, pred] of Object.entries(userPreds)) {
      predictionsMade++;
      const result = results[fixtureId];
      if (!result) continue; // not yet played

      const scored = scoreOnePrediction(
        pred.predictedHomeScore,
        pred.predictedAwayScore,
        result.home,
        result.away,
      );
      totalPoints += scored.points;
      if (scored.type === 'exact') exactScores++;
      if (scored.type === 'result') correctResults++;
    }

    return { userName, totalPoints, exactScores, correctResults, predictionsMade, rank: 0 };
  });

  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores;
    return a.userName.localeCompare(b.userName);
  });

  entries.forEach((e, i) => { e.rank = i + 1; });
  return entries;
}
