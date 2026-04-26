'use client';

import { useEffect, useState, useCallback } from 'react';
import TeamBadge from '@/components/TeamBadge';
import type { FixtureWithStatus } from '@/types';
import { fixturesByRound, FIXTURES } from '@/lib/fixtures';

type ResultInputs = Record<string, { home: string; away: string }>;
type SavedResults = Record<string, { home: number; away: number }>;

interface DbStatus {
  connected: boolean;
  error: string | null;
  predictions: number;
  results: number;
  activeRound: string | null;
  predictionRows: { user_name: string; fixture_id: string; predicted_home_score: number; predicted_away_score: number }[];
  resultRows: { fixture_id: string; home: number; away: number }[];
}

function formatKickoff(kickoff: string): string {
  const d = new Date(kickoff);
  return d.toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
  });
}

function fixtureName(id: string): string {
  const f = FIXTURES.find((x) => x.id === id);
  return f ? `${f.homeTeam} v ${f.awayTeam}` : `Fixture ${id}`;
}

const ROUNDS = [34, 35, 36, 37, 38];

// ── Database Status Panel ─────────────────────────────────────────────────

function DatabasePanel() {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  async function checkStatus() {
    setChecking(true);
    try {
      const res = await fetch('/api/admin/status');
      const data: DbStatus = await res.json();
      setStatus(data);
    } catch {
      setStatus({ connected: false, error: 'Could not reach API', predictions: 0, results: 0, activeRound: null, predictionRows: [], resultRows: [] });
    }
    setChecking(false);
  }

  async function seedData() {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      setSeedMsg(data.ok ? `✓ ${data.message}` : `✗ ${data.error}`);
      await checkStatus(); // refresh counts
    } catch {
      setSeedMsg('✗ Seed request failed');
    }
    setSeeding(false);
  }

  useEffect(() => { checkStatus(); }, []);

  const needsSeed = status?.connected && (status.predictions ?? 0) < 6;

  return (
    <div className={`border rounded-2xl p-4 space-y-4 ${
      status?.connected === false
        ? 'bg-tartan-600/10 border-tartan-500/30'
        : 'bg-pitch-800 border-pitch-600'
    }`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-white">Database Status</h2>
        <button
          onClick={checkStatus}
          disabled={checking}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          {checking ? 'Checking…' : '↻ Refresh'}
        </button>
      </div>

      {/* Connection status */}
      {!status ? (
        <p className="text-slate-500 text-sm">Checking connection…</p>
      ) : !status.connected ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-tartan-400 font-black text-lg">✗</span>
            <span className="text-tartan-400 font-bold text-sm">Not connected</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed bg-pitch-900 rounded-xl p-3">
            {status.error}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary pills */}
          <div className="flex gap-2 flex-wrap">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-center">
              <div className="text-emerald-400 font-black text-lg">{status.predictions}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Predictions</div>
            </div>
            <div className="bg-saltire-500/10 border border-saltire-500/20 rounded-xl px-3 py-2 text-center">
              <div className="text-saltire-400 font-black text-lg">{status.results}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Results</div>
            </div>
            <div className="bg-pitch-700 border border-pitch-600 rounded-xl px-3 py-2 text-center flex-1">
              <div className="text-white font-black text-lg">Rd {status.activeRound ?? '—'}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Active</div>
            </div>
          </div>

          {/* Seed button — shown when fewer than 6 predictions exist */}
          {needsSeed && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-2">
              <p className="text-amber-400 text-xs font-bold">
                Only {status.predictions} prediction{status.predictions !== 1 ? 's' : ''} found in database.
                The Round 34 predictions need to be seeded.
              </p>
              <button
                onClick={seedData}
                disabled={seeding}
                className="w-full py-2 rounded-lg bg-amber-500 text-pitch-950 font-black text-sm hover:bg-amber-400 transition-all active:scale-[0.98]"
              >
                {seeding ? 'Seeding…' : 'Seed Round 34 Predictions'}
              </button>
            </div>
          )}

          {seedMsg && (
            <p className={`text-xs font-bold px-3 py-2 rounded-lg ${
              seedMsg.startsWith('✓') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-tartan-500/10 text-tartan-400'
            }`}>
              {seedMsg}
            </p>
          )}

          {/* Prediction rows */}
          {status.predictionRows.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Stored Predictions
              </p>
              <div className="space-y-1">
                {status.predictionRows.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-pitch-700">
                    <span className="font-bold text-slate-300 w-14">{r.user_name}</span>
                    <span className="text-slate-500 flex-1 text-center">{fixtureName(r.fixture_id)}</span>
                    <span className="font-black text-white w-10 text-right">
                      {r.predicted_home_score}–{r.predicted_away_score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result rows */}
          {status.resultRows.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Stored Results
              </p>
              <div className="space-y-1">
                {status.resultRows.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-pitch-700">
                    <span className="text-slate-400 flex-1">{fixtureName(r.fixture_id)}</span>
                    <span className="font-black text-emerald-400">{r.home}–{r.away}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status.predictionRows.length === 0 && status.resultRows.length === 0 && !needsSeed && (
            <p className="text-xs text-slate-600 text-center py-2">Database connected but empty</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────

export default function AdminPage() {
  const [player, setPlayer] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState<number>(34);
  const [roundSaving, setRoundSaving] = useState(false);
  const [fixtures, setFixtures] = useState<FixtureWithStatus[]>([]);
  const [inputs, setInputs] = useState<ResultInputs>({});
  const [savedResults, setSavedResults] = useState<SavedResults>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorId, setErrorId] = useState<string | null>(null);

  useEffect(() => {
    setPlayer(localStorage.getItem('top6_player'));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/fixtures').then((r) => r.json()),
    ])
      .then(([settings, data]: [{ activeRound: number }, FixtureWithStatus[]]) => {
        setActiveRound(settings.activeRound);
        setFixtures(data);

        const initInputs: ResultInputs = {};
        const initSaved: SavedResults = {};
        for (const f of data) {
          if (f.status === 'completed' && f.actualHomeScore !== null && f.actualAwayScore !== null) {
            initInputs[f.id] = { home: String(f.actualHomeScore), away: String(f.actualAwayScore) };
            initSaved[f.id] = { home: f.actualHomeScore, away: f.actualAwayScore };
          }
        }
        setInputs(initInputs);
        setSavedResults(initSaved);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function setRound(round: number) {
    setRoundSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeRound: round }),
    });
    if (res.ok) setActiveRound(round);
    setRoundSaving(false);
  }

  const setInput = useCallback((id: string, side: 'home' | 'away', val: string) => {
    setInputs((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { home: '', away: '' }), [side]: val },
    }));
  }, []);

  async function saveResult(fixtureId: string) {
    const inp = inputs[fixtureId];
    if (!inp) return;

    const home = parseInt(inp.home, 10);
    const away = parseInt(inp.away, 10);
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0 || home > 20 || away > 20) {
      setErrorId(fixtureId);
      setTimeout(() => setErrorId(null), 2000);
      return;
    }

    setSavingId(fixtureId);
    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId, home, away }),
    });

    if (res.ok) {
      setSavedResults((prev) => ({ ...prev, [fixtureId]: { home, away } }));
      setFixtures((prev) =>
        prev.map((f) =>
          f.id === fixtureId
            ? { ...f, status: 'completed', actualHomeScore: home, actualAwayScore: away }
            : f,
        ),
      );
      setFlashId(fixtureId);
      setTimeout(() => setFlashId(null), 2500);
    }
    setSavingId(null);
  }

  async function clearResult(fixtureId: string) {
    setSavingId(fixtureId);
    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId, delete: true }),
    });

    if (res.ok) {
      setSavedResults((prev) => { const next = { ...prev }; delete next[fixtureId]; return next; });
      setInputs((prev) => { const next = { ...prev }; delete next[fixtureId]; return next; });
      setFixtures((prev) =>
        prev.map((f) =>
          f.id === fixtureId
            ? { ...f, status: 'upcoming', actualHomeScore: null, actualAwayScore: null }
            : f,
        ),
      );
    }
    setSavingId(null);
  }

  // ── Access gate ──────────────────────────────────────────────────────────
  if (player !== null && player !== 'CJ') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-black text-white">Admin access only</h2>
        <p className="text-slate-400 text-sm max-w-xs">
          Only CJ can enter match results. Switch to CJ from the home screen.
        </p>
      </div>
    );
  }

  if (loading || player === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading…</div>
      </div>
    );
  }

  const roundMap = fixturesByRound();
  const rounds = [...roundMap.keys()].sort((a, b) => a - b);
  const completedCount = fixtures.filter((f) => f.status === 'completed').length;

  return (
    <div className="py-6 space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-black text-white">Admin</h1>
          <span className="text-xs bg-tartan-500/20 text-tartan-400 border border-tartan-500/30 px-2 py-0.5 rounded-full font-bold">
            CJ Only
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Verify database, seed predictions, enter results, manage rounds.
        </p>
        <p className="text-xs text-slate-600 mt-1">{completedCount}/13 results entered</p>
      </div>

      {/* ── Database status ────────────────────────────────────────────── */}
      <DatabasePanel />

      {/* ── Round unlock ──────────────────────────────────────────────── */}
      <div className="bg-pitch-800 border border-pitch-600 rounded-2xl p-4 space-y-3">
        <div>
          <h2 className="text-sm font-black text-white">Active Round</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Only this round is visible to players for predictions.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROUNDS.map((round) => (
            <button
              key={round}
              onClick={() => setRound(round)}
              disabled={roundSaving}
              className={`flex-1 min-w-[52px] py-3 rounded-xl font-black text-sm transition-all active:scale-[0.97] ${
                activeRound === round
                  ? 'bg-emerald-500 text-pitch-950 shadow-lg shadow-emerald-500/25'
                  : 'bg-pitch-700 border border-pitch-600 text-slate-400 hover:text-white hover:bg-pitch-600'
              }`}
            >
              {round}
              {activeRound === round && (
                <span className="block text-[9px] font-bold opacity-70 mt-0.5">OPEN</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results entry ──────────────────────────────────────────────── */}
      {rounds.map((round) => {
        const roundFixtures = roundMap.get(round)!;
        const fixturesWithStatus = roundFixtures.map(
          (f) => fixtures.find((x) => x.id === f.id) ?? { ...f, status: 'upcoming' as const, actualHomeScore: null, actualAwayScore: null },
        );

        return (
          <section key={round}>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs uppercase tracking-widest font-bold text-slate-500">Round {round}</div>
              <div className="flex-1 h-px bg-pitch-700" />
              <div className="text-xs text-slate-600">
                {fixturesWithStatus.filter((f) => f.status === 'completed').length}/{fixturesWithStatus.length} done
              </div>
            </div>

            <div className="space-y-3">
              {fixturesWithStatus.map((fixture) => {
                const inp = inputs[fixture.id] ?? { home: '', away: '' };
                const isSaving = savingId === fixture.id;
                const isFlash = flashId === fixture.id;
                const isError = errorId === fixture.id;
                const existing = savedResults[fixture.id];

                const homeVal = parseInt(inp.home, 10);
                const awayVal = parseInt(inp.away, 10);
                const inputsValid =
                  !isNaN(homeVal) && !isNaN(awayVal) &&
                  homeVal >= 0 && awayVal >= 0 && homeVal <= 20 && awayVal <= 20;
                const changed = !existing || existing.home !== homeVal || existing.away !== awayVal;

                return (
                  <div
                    key={fixture.id}
                    className={`bg-pitch-800 border rounded-2xl p-4 space-y-3 transition-colors ${
                      fixture.status === 'completed' ? 'border-emerald-500/20' : 'border-pitch-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatKickoff(fixture.kickoff)}</span>
                      <span className="text-slate-600">{fixture.venue}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <TeamBadge team={fixture.homeTeam} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm">{fixture.homeTeam}</div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number" min={0} max={20} value={inp.home}
                          onChange={(e) => setInput(fixture.id, 'home', e.target.value)}
                          placeholder="–"
                          className={`w-12 h-10 bg-pitch-700 border rounded-lg text-center text-white font-bold text-lg focus:outline-none transition-colors ${
                            isError ? 'border-tartan-500' : fixture.status === 'completed' ? 'border-emerald-500/40' : 'border-pitch-500 focus:border-emerald-500/60'
                          }`}
                        />
                        <span className="text-slate-600 font-bold">–</span>
                        <input
                          type="number" min={0} max={20} value={inp.away}
                          onChange={(e) => setInput(fixture.id, 'away', e.target.value)}
                          placeholder="–"
                          className={`w-12 h-10 bg-pitch-700 border rounded-lg text-center text-white font-bold text-lg focus:outline-none transition-colors ${
                            isError ? 'border-tartan-500' : fixture.status === 'completed' ? 'border-emerald-500/40' : 'border-pitch-500 focus:border-emerald-500/60'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0 text-right">
                        <div className="font-bold text-white text-sm">{fixture.awayTeam}</div>
                      </div>
                      <TeamBadge team={fixture.awayTeam} />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => saveResult(fixture.id)}
                        disabled={isSaving || !inputsValid || !changed}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                          isFlash ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isError ? 'bg-tartan-500/20 text-tartan-400 border border-tartan-500/30'
                          : inputsValid && changed ? 'bg-emerald-500 text-pitch-950 hover:bg-emerald-400'
                          : 'bg-pitch-700 text-slate-500 cursor-default'
                        }`}
                      >
                        {isSaving ? 'Saving…' : isFlash ? '✓ Result saved' : isError ? 'Invalid score' : existing && !changed ? '✓ Saved' : 'Save Result'}
                      </button>

                      {fixture.status === 'completed' && (
                        <button
                          onClick={() => clearResult(fixture.id)}
                          disabled={isSaving}
                          className="px-4 py-2.5 rounded-xl font-bold text-sm bg-pitch-700 border border-pitch-600 text-slate-500 hover:text-tartan-400 hover:border-tartan-500/40 transition-all"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
