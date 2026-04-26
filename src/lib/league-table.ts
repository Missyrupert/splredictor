import type { AllResults } from '@/types';
import { FIXTURES } from './fixtures';

export interface TeamStanding {
  team: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

// Standings as of end of Round 33 / start of the split (before any split results)
const BASE_STANDINGS = [
  { team: 'Hearts',     mp: 33, w: 21, d: 7,  l: 5,  gf: 58, ga: 28 },
  { team: 'Celtic',     mp: 34, w: 22, d: 4,  l: 8,  gf: 62, ga: 36 },
  { team: 'Rangers',    mp: 33, w: 19, d: 12, l: 2,  gf: 66, ga: 31 },
  { team: 'Motherwell', mp: 33, w: 14, d: 12, l: 7,  gf: 52, ga: 29 },
  { team: 'Hibernian',  mp: 33, w: 13, d: 12, l: 8,  gf: 51, ga: 37 },
  { team: 'Falkirk',    mp: 34, w: 13, d: 7,  l: 14, gf: 46, ga: 51 },
];

export function calculateTable(results: AllResults): TeamStanding[] {
  // Deep-copy base standings into a mutable map
  const table: Record<string, { mp: number; w: number; d: number; l: number; gf: number; ga: number }> = {};
  for (const row of BASE_STANDINGS) {
    table[row.team] = { mp: row.mp, w: row.w, d: row.d, l: row.l, gf: row.gf, ga: row.ga };
  }

  // Apply each entered split result
  for (const [fixtureId, result] of Object.entries(results)) {
    const fixture = FIXTURES.find((f) => f.id === fixtureId);
    if (!fixture) continue;

    const home = table[fixture.homeTeam];
    const away = table[fixture.awayTeam];
    if (!home || !away) continue;

    home.mp += 1;
    away.mp += 1;
    home.gf += result.home;
    home.ga += result.away;
    away.gf += result.away;
    away.ga += result.home;

    if (result.home > result.away) {
      home.w += 1;
      away.l += 1;
    } else if (result.home < result.away) {
      away.w += 1;
      home.l += 1;
    } else {
      home.d += 1;
      away.d += 1;
    }
  }

  return Object.entries(table)
    .map(([team, s]) => ({
      team,
      mp: s.mp,
      w: s.w,
      d: s.d,
      l: s.l,
      gf: s.gf,
      ga: s.ga,
      gd: s.gf - s.ga,
      pts: s.w * 3 + s.d,
    }))
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.team.localeCompare(b.team);
    });
}
