import { promises as fs } from 'fs';
import path from 'path';
import type { AllPredictions, AllResults } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const PREDICTIONS_FILE = path.join(DATA_DIR, 'predictions.json');
const RESULTS_FILE = path.join(DATA_DIR, 'results.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export interface AppSettings {
  activeRound: number; // which round is currently open for predictions
}

const DEFAULT_SETTINGS: AppSettings = { activeRound: 34 };

async function ensureFile(filePath: string, defaultValue: unknown): Promise<void> {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  }
}

async function readJson<T>(filePath: string, defaultValue: T): Promise<T> {
  await ensureFile(filePath, defaultValue);
  const raw = await fs.readFile(filePath, 'utf-8');
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Predictions ────────────────────────────────────────────────────────────

export async function readPredictions(): Promise<AllPredictions> {
  return readJson<AllPredictions>(PREDICTIONS_FILE, {});
}

export async function writePredictions(data: AllPredictions): Promise<void> {
  await writeJson(PREDICTIONS_FILE, data);
}

export async function savePrediction(
  userName: string,
  fixtureId: string,
  home: number,
  away: number,
): Promise<void> {
  const all = await readPredictions();
  if (!all[userName]) all[userName] = {};
  const now = new Date().toISOString();
  all[userName][fixtureId] = {
    predictedHomeScore: home,
    predictedAwayScore: away,
    createdAt: all[userName][fixtureId]?.createdAt ?? now,
    updatedAt: now,
  };
  await writePredictions(all);
}

// ── Results ────────────────────────────────────────────────────────────────

export async function readResults(): Promise<AllResults> {
  return readJson<AllResults>(RESULTS_FILE, {});
}

export async function saveResult(
  fixtureId: string,
  home: number,
  away: number,
): Promise<void> {
  const all = await readResults();
  all[fixtureId] = { home, away, savedAt: new Date().toISOString() };
  await writeJson(RESULTS_FILE, all);
}

export async function deleteResult(fixtureId: string): Promise<void> {
  const all = await readResults();
  delete all[fixtureId];
  await writeJson(RESULTS_FILE, all);
}

// ── Settings ───────────────────────────────────────────────────────────────

export async function readSettings(): Promise<AppSettings> {
  return readJson<AppSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await writeJson(SETTINGS_FILE, settings);
}
