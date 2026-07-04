/*
 * Pure Wordle game logic — a direct port of the iOS app's WordleEngine.swift.
 * No React here so it's trivial to reason about and test.
 */

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export type GameStatus = "playing" | "won" | "lost";

/** Result of a single letter in a guess. */
export type LetterState =
  | "empty" // no letter typed
  | "tbd" // letter typed, guess not submitted
  | "absent" // letter not in word
  | "present" // letter in word, wrong position
  | "correct"; // letter in correct position

export interface LetterCell {
  letter: string | null;
  state: LetterState;
}

export const blankCell = (): LetterCell => ({ letter: null, state: "empty" });

export const emptyGuess = (length: number = WORD_LENGTH): LetterCell[] =>
  Array.from({ length }, blankCell);

/**
 * Score a guess against the answer using Wordle's two-pass algorithm, which
 * handles duplicate letters correctly (greens first, then remaining letters
 * fund the yellows).
 */
export function scoreGuess(guess: string, answer: string): LetterState[] {
  const g = guess.toUpperCase().split("");
  const a = answer.toUpperCase().split("");
  const states: LetterState[] = g.map(() => "absent");

  // Track unmatched letters from the answer for the second pass.
  const remaining: Record<string, number> = {};

  // Pass 1: correct positions.
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      states[i] = "correct";
    } else {
      remaining[a[i]] = (remaining[a[i]] ?? 0) + 1;
    }
  }

  // Pass 2: present (yellow) — only while a matching letter remains.
  for (let i = 0; i < g.length; i++) {
    if (states[i] === "correct") continue;
    const ch = g[i];
    if ((remaining[ch] ?? 0) > 0) {
      states[i] = "present";
      remaining[ch] -= 1;
    }
  }

  return states;
}

/**
 * Merge a letter's newly-scored state into the on-screen keyboard state,
 * respecting the priority correct > present > absent (a key never downgrades).
 */
export function mergeKeyState(
  current: LetterState | undefined,
  next: LetterState
): LetterState {
  const rank: Record<LetterState, number> = {
    empty: 0,
    tbd: 0,
    absent: 1,
    present: 2,
    correct: 3,
  };
  if (current === undefined) return next;
  return rank[next] > rank[current] ? next : current;
}

/** Encouraging win message keyed by the row (0-indexed) that solved it. */
export function winMessage(row: number): string {
  return (
    ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!"][row] ??
    "Phew!"
  );
}
