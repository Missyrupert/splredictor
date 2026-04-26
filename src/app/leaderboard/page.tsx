'use client';

import { useEffect, useState } from 'react';
import TeamBadge from '@/components/TeamBadge';
import type { LeaderboardEntry } from '@/types';

// ── Prediction leaderboard ────────────────────────────────────────────────────

const RANK_ICONS = ['🥇', '🥈', '🥉'];
const RANK_RING = [
  'border-amber-500/40 bg-amber-500/5',
  'border-slate-400/30 bg-slate-400/5',
  'border-amber-700/30 bg-amber-700/5',
  'border-pitch-600 bg-pitch-800',
];

function PredictionLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<string | null>(null);

  useEffect(() => {
    setPlayer(localStorage.getItem('top6_player'));
  }, []);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data: LeaderboardEntry[]) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const hasAnyPoints = entries.some((e) => e.totalPoints > 0);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-black text-white">Prediction Standings</h2>
        <div className="flex-1 h-px bg-pitch-700" />
      </div>

      {loading && <p className="text-slate-500 text-sm py-4 text-center">Loading…</p>}

      {!loading && !hasAnyPoints && (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-slate-400 font-bold">No results yet</p>
          <p className="text-slate-600 text-sm mt-1">
            Scores appear here once the admin enters match results.
          </p>
        </div>
      )}

      {entries.map((entry, i) => {
        const isMe = entry.userName === player;
        const ring = RANK_RING[i] ?? RANK_RING[3];

        return (
          <div
            key={entry.userName}
            className={`border rounded-2xl p-4 animate-slide-up ${ring} ${isMe ? 'ring-1 ring-emerald-500/40' : ''}`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-9 text-center shrink-0">
                {i < 3
                  ? <span className="text-xl">{RANK_ICONS[i]}</span>
                  : <span className="text-base font-black text-slate-500">{i + 1}</span>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{entry.userName}</span>
                  {isMe && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold">
                      You
                    </span>
                  )}
                </div>
                <div className="flex gap-3 mt-1 text-xs text-slate-500">
                  <span><span className="text-emerald-400 font-bold">{entry.exactScores}</span> exact</span>
                  <span><span className="text-saltire-400 font-bold">{entry.correctResults}</span> result</span>
                  <span><span className="text-slate-400 font-bold">{entry.predictionsMade}</span>/13 predicted</span>
                </div>
                {hasAnyPoints && (
                  <div className="mt-2 h-1.5 bg-pitch-700 rounded-full overflow-hidden max-w-[160px]">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((entry.totalPoints / 39) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className={`text-3xl font-black tabular-nums ${i === 0 && hasAnyPoints ? 'text-amber-400' : 'text-slate-100'}`}>
                  {entry.totalPoints}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">pts</div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  return (
    <div className="py-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Leaderboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Top 6 Prediction League · 2025/26</p>
      </div>

      <PredictionLeaderboard />

      {/* Scoring guide */}
      <div className="bg-pitch-800 border border-pitch-600 rounded-2xl p-4">
        <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3">Scoring</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { pts: 3, label: 'Exact Score',    color: 'text-emerald-400' },
            { pts: 1, label: 'Correct Result', color: 'text-saltire-400' },
            { pts: 0, label: 'Incorrect',      color: 'text-slate-500'   },
          ].map((s) => (
            <div key={s.pts} className="bg-pitch-700 rounded-xl p-3">
              <div className={`text-2xl font-black ${s.color}`}>{s.pts}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
