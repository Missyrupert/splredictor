'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLAYERS, type PlayerName } from '@/types';

const SCORING = [
  { pts: 3, label: 'Exact Score',    color: 'text-emerald-400' },
  { pts: 1, label: 'Correct Result', color: 'text-saltire-400' },
  { pts: 0, label: 'Wrong',          color: 'text-slate-600'   },
];

export default function SelectPlayerPage() {
  const router = useRouter();
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    setCurrent(localStorage.getItem('top6_player'));
  }, []);

  function select(name: PlayerName) {
    localStorage.setItem('top6_player', name);
    // Trigger Nav update
    window.dispatchEvent(new Event('storage'));
    router.push('/predict');
  }

  function clear() {
    localStorage.removeItem('top6_player');
    window.dispatchEvent(new Event('storage'));
    setCurrent(null);
  }

  return (
    <div className="min-h-[80vh] tartan-bg flex flex-col items-center justify-center py-10 -mx-4 px-4">
      <div className="w-full max-w-sm animate-slide-up">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-5 select-none">🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
          <h1 className="text-5xl font-black text-white uppercase leading-none tracking-tight">
            Top 6
          </h1>
          <h1 className="text-5xl font-black text-emerald-400 uppercase leading-none tracking-tight mb-3">
            Prediction
          </h1>
          <h1 className="text-5xl font-black text-white uppercase leading-none tracking-tight mb-5">
            League
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Scottish Premiership · Top 6 Split · 2025/26
          </p>
          <p className="text-slate-600 text-xs mt-1">
            Rounds 34–38 · 12 fixtures
          </p>
        </div>

        {/* Scoring pills */}
        <div className="flex gap-2 mb-8">
          {SCORING.map((s) => (
            <div
              key={s.pts}
              className="flex-1 bg-pitch-800 border border-pitch-600 rounded-xl py-3 text-center"
            >
              <div className={`text-2xl font-black ${s.color}`}>{s.pts}</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Player selection */}
        <div className="space-y-2 mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">
            Select your name
          </p>
          {PLAYERS.map((name) => {
            const isActive = current === name;
            return (
              <button
                key={name}
                onClick={() => select(name)}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98] ${
                  isActive
                    ? 'bg-emerald-500 text-pitch-950 shadow-lg shadow-emerald-500/25'
                    : 'bg-pitch-800 border border-pitch-600 text-slate-200 hover:bg-pitch-700 hover:border-pitch-500'
                }`}
              >
                {name}
                {isActive && (
                  <span className="ml-2 text-sm opacity-75">· active</span>
                )}
              </button>
            );
          })}
        </div>

        {current && (
          <button
            onClick={clear}
            className="w-full text-sm text-slate-600 hover:text-slate-400 transition-colors py-2"
          >
            Clear selection
          </button>
        )}
      </div>
    </div>
  );
}
