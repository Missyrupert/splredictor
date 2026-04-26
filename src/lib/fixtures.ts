import type { Fixture } from '@/types';

// All times are UK (BST = UTC+1) as per official fixture announcements.
// Season year: 2026.

export const FIXTURES: Fixture[] = [
  // ── Round 34 ──────────────────────────────────────────────────────────
  {
    id: '1',
    roundNumber: 34,
    homeTeam: 'Celtic',
    awayTeam: 'Falkirk',
    kickoff: '2026-04-25T17:30:00+01:00',
    venue: 'Celtic Park',
  },
  {
    id: '2',
    roundNumber: 34,
    homeTeam: 'Hibernian',
    awayTeam: 'Hearts',
    kickoff: '2026-04-26T16:30:00+01:00',
    venue: 'Easter Road',
  },
  {
    id: '13',
    roundNumber: 34,
    homeTeam: 'Rangers',
    awayTeam: 'Motherwell',
    kickoff: '2026-04-26T15:00:00+01:00',
    venue: 'Ibrox',
  },
  // ── Round 35 ──────────────────────────────────────────────────────────
  {
    id: '3',
    roundNumber: 35,
    homeTeam: 'Hibernian',
    awayTeam: 'Celtic',
    kickoff: '2026-05-03T12:00:00+01:00',
    venue: 'Easter Road',
  },
  {
    id: '4',
    roundNumber: 35,
    homeTeam: 'Hearts',
    awayTeam: 'Rangers',
    kickoff: '2026-05-04T17:30:00+01:00',
    venue: 'Tynecastle',
  },
  // ── Round 36 ──────────────────────────────────────────────────────────
  {
    id: '5',
    roundNumber: 36,
    homeTeam: 'Motherwell',
    awayTeam: 'Hearts',
    kickoff: '2026-05-09T20:00:00+01:00',
    venue: 'Fir Park',
  },
  {
    id: '6',
    roundNumber: 36,
    homeTeam: 'Celtic',
    awayTeam: 'Rangers',
    kickoff: '2026-05-10T12:00:00+01:00',
    venue: 'Celtic Park',
  },
  // ── Round 37 ──────────────────────────────────────────────────────────
  {
    id: '7',
    roundNumber: 37,
    homeTeam: 'Hearts',
    awayTeam: 'Falkirk',
    kickoff: '2026-05-13T20:00:00+01:00',
    venue: 'Tynecastle',
  },
  {
    id: '8',
    roundNumber: 37,
    homeTeam: 'Motherwell',
    awayTeam: 'Celtic',
    kickoff: '2026-05-13T20:00:00+01:00',
    venue: 'Fir Park',
  },
  {
    id: '9',
    roundNumber: 37,
    homeTeam: 'Rangers',
    awayTeam: 'Hibernian',
    kickoff: '2026-05-13T20:00:00+01:00',
    venue: 'Ibrox',
  },
  // ── Round 38 ──────────────────────────────────────────────────────────
  {
    id: '10',
    roundNumber: 38,
    homeTeam: 'Celtic',
    awayTeam: 'Hearts',
    kickoff: '2026-05-16T12:30:00+01:00',
    venue: 'Celtic Park',
  },
  {
    id: '11',
    roundNumber: 38,
    homeTeam: 'Falkirk',
    awayTeam: 'Rangers',
    kickoff: '2026-05-16T12:30:00+01:00',
    venue: 'Falkirk Stadium',
  },
  {
    id: '12',
    roundNumber: 38,
    homeTeam: 'Hibernian',
    awayTeam: 'Motherwell',
    kickoff: '2026-05-16T12:30:00+01:00',
    venue: 'Easter Road',
  },
];

// Team visual identity
export const TEAM_META: Record<string, { color: string; badge: string }> = {
  Celtic:     { color: '#16a34a', badge: 'CEL' },
  Rangers:    { color: '#1d4ed8', badge: 'RFC' },
  Hibernian:  { color: '#15803d', badge: 'HIB' },
  Hearts:     { color: '#9f1239', badge: 'HRT' },
  Motherwell: { color: '#d97706', badge: 'MFC' },
  Falkirk:    { color: '#2563eb', badge: 'FAL' },
};

// Group fixtures by round number
export function fixturesByRound(): Map<number, Fixture[]> {
  const map = new Map<number, Fixture[]>();
  for (const f of FIXTURES) {
    const list = map.get(f.roundNumber) ?? [];
    list.push(f);
    map.set(f.roundNumber, list);
  }
  return map;
}
