/*
 * Local-first persistence for Wordle: lifetime stats + resumable saved games.
 * Everything lives in localStorage; there is no account or backend.
 */
import { dayKey } from "./seed";
import { MAX_GUESSES, GameStatus } from "../wordle/engine";

const STATS_KEY = "pt:wordle:stats";
const DAILY_KEY = "pt:wordle:daily";
const RANDOM_KEY = "pt:wordle:random";

export interface WordleStats {
  played: number;
  wins: number;
  /** Consecutive wins (any mode), classic-Wordle style. */
  currentStreak: number;
  maxStreak: number;
  /** Wins bucketed by the guess count that solved them (index 0 = 1 guess). */
  distribution: number[];
  /** Daily-mode streak, keyed on consecutive calendar days solved. */
  lastDailyDate: string | null;
  dailyStreak: number;
  maxDailyStreak: number;
}

/** A resumable in-progress or finished game. */
export interface SavedGame {
  answer: string;
  guesses: string[]; // submitted words, in order
  status: GameStatus;
  /** For daily games: the day this board belongs to. */
  date?: string;
  /** Whether this result has already been folded into lifetime stats. */
  recorded: boolean;
}

const emptyStats = (): WordleStats => ({
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: Array(MAX_GUESSES).fill(0),
  lastDailyDate: null,
  dailyStreak: 0,
  maxDailyStreak: 0,
});

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as object) } : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode); degrade silently */
  }
}

export function loadStats(): WordleStats {
  const s = readJSON<WordleStats>(STATS_KEY, emptyStats());
  // Guard against malformed distribution arrays from older saves.
  if (!Array.isArray(s.distribution) || s.distribution.length !== MAX_GUESSES) {
    s.distribution = Array(MAX_GUESSES).fill(0);
  }
  return s;
}

function isYesterday(dateStr: string): boolean {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return dateStr === dayKey(y);
}

/**
 * Fold a finished game into lifetime stats and return the updated snapshot.
 * `isDaily` also advances the date-based daily streak (once per day).
 */
export function recordResult(opts: {
  won: boolean;
  guessCount: number; // 1-based row that solved it (only meaningful on a win)
  isDaily: boolean;
}): WordleStats {
  const stats = loadStats();
  stats.played += 1;

  if (opts.won) {
    stats.wins += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    const idx = Math.min(opts.guessCount, MAX_GUESSES) - 1;
    if (idx >= 0) stats.distribution[idx] += 1;
  } else {
    stats.currentStreak = 0;
  }

  if (opts.isDaily && opts.won) {
    const today = dayKey();
    if (stats.lastDailyDate === today) {
      // already counted today
    } else {
      stats.dailyStreak =
        stats.lastDailyDate && isYesterday(stats.lastDailyDate)
          ? stats.dailyStreak + 1
          : 1;
      stats.lastDailyDate = today;
      stats.maxDailyStreak = Math.max(stats.maxDailyStreak, stats.dailyStreak);
    }
  }

  writeJSON(STATS_KEY, stats);
  return stats;
}

export function loadDailyGame(): SavedGame | null {
  const raw = localStorage.getItem(DAILY_KEY);
  if (!raw) return null;
  try {
    const g = JSON.parse(raw) as SavedGame;
    return g.date === dayKey() ? g : null; // stale board -> ignore
  } catch {
    return null;
  }
}

export function saveDailyGame(game: SavedGame): void {
  writeJSON(DAILY_KEY, { ...game, date: dayKey() });
}

export function loadRandomGame(): SavedGame | null {
  const raw = localStorage.getItem(RANDOM_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedGame;
  } catch {
    return null;
  }
}

export function saveRandomGame(game: SavedGame): void {
  writeJSON(RANDOM_KEY, game);
}

export function clearRandomGame(): void {
  try {
    localStorage.removeItem(RANDOM_KEY);
  } catch {
    /* ignore */
  }
}
