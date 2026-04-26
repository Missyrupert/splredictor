'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TeamBadge from '@/components/TeamBadge';
import type { FixtureWithStatus, Prediction } from '@/types';
import { FIXTURES } from '@/lib/fixtures';

type SavedPredictions = Record<string, Pick<Prediction, 'predictedHomeScore' | 'predictedAwayScore'>>;
type InputState = Record<string, { home: string; away: string }>;

function isKickoffPassed(kickoff: string): boolean {
  return new Date(kickoff) <= new Date();
}

function formatKickoff(kickoff: string): string {
  const d = new Date(kickoff);
  return d.toLocaleString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
  });
}

export default function PredictPage() {
  const router = useRouter();
  const [player, setPlayer] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState<number | null>(null);
  const [saved, setSaved] = useState<SavedPredictions>({});
  const [inputs, setInputs] = useState<InputState>({});
  const [results, setResults] = useState<Record<string, { home: number; away: number }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = localStorage.getItem('top6_player');
    if (!p) { router.push('/'); return; }
    setPlayer(p);
  }, [router]);

  useEffect(() => {
    if (!player) return;

    Promise.all([
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/fixtures').then((r) => r.json()),
      fetch(`/api/predictions?userName=${encodeURIComponent(player)}`).then((r) => r.json()),
    ]).then(([settings, fixtures, preds]: [{ activeRound: number }, FixtureWithStatus[], SavedPredictions]) => {
      setActiveRound(settings.activeRound);

      // Build results map
      const resultMap: Record<string, { home: number; away: number }> = {};
      for (const f of fixtures) {
        if (f.status === 'completed' && f.actualHomeScore !== null && f.actualAwayScore !== null) {
          resultMap[f.id] = { home: f.actualHomeScore, away: f.actualAwayScore };
        }
      }
      setResults(resultMap);
      setSaved(preds);

      // Pre-fill inputs from saved predictions
      const init: InputState = {};
      for (const [id, pred] of Object.entries(preds)) {
        init[id] = {
          home: String(pred.predictedHomeScore),
          away: String(pred.predictedAwayScore),
        };
      }
      setInputs(init);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [player]);

  const setInput = useCallback((fixtureId: string, side: 'home' | 'away', val: string) => {
    setInputs((prev) => ({
      ...prev,
      [fixtureId]: { ...(prev[fixtureId] ?? { home: '', away: '' }), [side]: val },
    }));
  }, []);

  async function savePrediction(fixtureId: string) {
    if (!player) return;
    const inp = inputs[fixtureId];
    if (!inp) return;

    const home = parseInt(inp.home, 10);
    const away = parseInt(inp.away, 10);
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0 || home > 20 || away > 20) return;

    setSavingId(fixtureId);
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: player,
        fixtureId,
        predictedHomeScore: home,
        predictedAwayScore: away,
      }),
    });

    if (res.ok) {
      setSaved((prev) => ({
        ...prev,
        [fixtureId]: { predictedHomeScore: home, predictedAwayScore: away },
      }));
      setSavedFlash((prev) => new Set(prev).add(fixtureId));
      setTimeout(() => {
        setSavedFlash((prev) => {
          const next = new Set(prev);
          next.delete(fixtureId);
          return next;
        });
      }, 2000);
    }
    setSavingId(null);
  }

  if (!player || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading…</div>
      </div>
    );
  }

  // Only show fixtures for the active round
  const roundFixtures = FIXTURES.filter((f) => f.roundNumber === activeRound);
  const savedCount = roundFixtures.filter((f) => saved[f.id]).length;

  return (
    <div className="py-6 space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Predict</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Playing as <span className="text-emerald-400 font-bold">{player}</span>
            {activeRound && (
              <span className="text-slate-600"> · Round {activeRound}</span>
            )}
          </p>
        </div>
        {roundFixtures.length > 0 && (
          <div className="text-right">
            <div className="text-xs text-slate-500">Saved</div>
            <div className="text-lg font-black text-slate-300">
              {savedCount}/{roundFixtures.length}
            </div>
          </div>
        )}
      </div>

      {/* No active round / no fixtures */}
      {roundFixtures.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-slate-300 mb-2">No fixtures open yet</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            The next round hasn't been unlocked. Check back soon.
          </p>
        </div>
      )}

      {/* Active round fixtures */}
      <div className="space-y-4">
        {roundFixtures.map((fixture) => {
          const locked = isKickoffPassed(fixture.kickoff);
          const result = results[fixture.id];
          const pred = saved[fixture.id];
          const inp = inputs[fixture.id] ?? { home: '', away: '' };
          const isSaving = savingId === fixture.id;
          const justSaved = savedFlash.has(fixture.id);

          const homeChanged = inp.home !== String(pred?.predictedHomeScore ?? '');
          const awayChanged = inp.away !== String(pred?.predictedAwayScore ?? '');
          const hasUnsaved =
            !locked && (homeChanged || awayChanged) && inp.home !== '' && inp.away !== '';

          return (
            <div
              key={fixture.id}
              className="bg-pitch-800 border border-pitch-600 rounded-2xl p-5 space-y-4"
            >
              {/* Kickoff & venue */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {formatKickoff(fixture.kickoff)}
                </span>
                <span className="text-xs text-slate-600">{fixture.venue}</span>
              </div>

              {/* Teams row */}
              <div className="flex items-center gap-3">
                {/* Home */}
                <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                  <TeamBadge team={fixture.homeTeam} size="lg" />
                  <span className="text-xs font-bold text-slate-300 text-center leading-tight">
                    {fixture.homeTeam}
                  </span>
                </div>

                {/* Score area */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  {result ? (
                    // Final result
                    <div className="text-center">
                      <div className="text-3xl font-black text-white tabular-nums">
                        {result.home}–{result.away}
                      </div>
                      <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">
                        Full Time
                      </div>
                    </div>
                  ) : locked ? (
                    // Kicked off, no result yet
                    <div className="text-center">
                      {pred ? (
                        <>
                          <div className="text-2xl font-black text-slate-400 tabular-nums">
                            {pred.predictedHomeScore}–{pred.predictedAwayScore}
                          </div>
                          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                            Your pick
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-black text-slate-600">–</div>
                          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                            No pick
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    // Open for prediction
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={inp.home}
                        onChange={(e) => setInput(fixture.id, 'home', e.target.value)}
                        placeholder="0"
                        className="w-14 h-14 bg-pitch-700 border-2 border-pitch-500 rounded-xl text-center text-white font-black text-2xl focus:border-emerald-500/70 focus:outline-none transition-colors"
                      />
                      <span className="text-slate-600 font-black text-xl">–</span>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={inp.away}
                        onChange={(e) => setInput(fixture.id, 'away', e.target.value)}
                        placeholder="0"
                        className="w-14 h-14 bg-pitch-700 border-2 border-pitch-500 rounded-xl text-center text-white font-black text-2xl focus:border-emerald-500/70 focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* Away */}
                <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                  <TeamBadge team={fixture.awayTeam} size="lg" />
                  <span className="text-xs font-bold text-slate-300 text-center leading-tight">
                    {fixture.awayTeam}
                  </span>
                </div>
              </div>

              {/* Scoring badge when result is in */}
              {result && pred && (
                <ScoreBadge
                  predHome={pred.predictedHomeScore}
                  predAway={pred.predictedAwayScore}
                  actualHome={result.home}
                  actualAway={result.away}
                />
              )}

              {/* Save / update button */}
              {!locked && !result && (
                <div className="space-y-1.5">
                  <button
                    onClick={() => savePrediction(fixture.id)}
                    disabled={isSaving || (!hasUnsaved && !!pred)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                      justSaved
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : hasUnsaved
                        ? 'bg-emerald-500 text-pitch-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400'
                        : pred
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                        : 'bg-pitch-700 border border-pitch-500 text-slate-400 hover:bg-pitch-600'
                    }`}
                  >
                    {isSaving
                      ? 'Saving…'
                      : justSaved
                      ? '✓ Updated'
                      : hasUnsaved
                      ? pred ? 'Update Prediction' : 'Save Prediction'
                      : pred
                      ? '✓ Saved'
                      : 'Save Prediction'}
                  </button>
                  {pred && !hasUnsaved && !justSaved && (
                    <p className="text-xs text-slate-600 text-center">
                      Change the scores above to update your prediction
                    </p>
                  )}
                </div>
              )}

              {/* Locked — match in progress */}
              {locked && !result && (
                <div className="text-center text-xs text-slate-600 py-0.5">
                  Predictions locked · match in progress
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBadge({
  predHome, predAway, actualHome, actualAway,
}: {
  predHome: number; predAway: number; actualHome: number; actualAway: number;
}) {
  const exact = predHome === actualHome && predAway === actualAway;
  const correctResult =
    !exact && Math.sign(predHome - predAway) === Math.sign(actualHome - actualAway);

  if (exact) {
    return (
      <div className="text-sm text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-center">
        🎯 +3 pts · Exact score! You predicted {predHome}–{predAway}
      </div>
    );
  }
  if (correctResult) {
    return (
      <div className="text-sm text-saltire-400 font-bold bg-saltire-500/10 border border-saltire-500/20 rounded-xl px-4 py-2 text-center">
        ✓ +1 pt · Correct result · You predicted {predHome}–{predAway}
      </div>
    );
  }
  return (
    <div className="text-sm text-slate-500 font-bold bg-pitch-700 rounded-xl px-4 py-2 text-center">
      ✗ 0 pts · You predicted {predHome}–{predAway}
    </div>
  );
}
