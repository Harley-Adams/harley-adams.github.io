/*
 * Word lists for Wordle — mirrors the iOS app's WordList.swift split:
 *  - ANSWERS: a curated pool of common, fair 5-letter words. Daily and random
 *    answers are drawn only from here so players never face an obscure word.
 *  - validGuessSet: a much larger superset of accepted guesses (broad 5-letter
 *    list ∪ answers), so any real word is a legal guess while answers stay common.
 */
import { ANSWERS } from "./data/answers";
import { VALID_GUESSES } from "./data/validGuesses";

const answerSet = new Set(ANSWERS);
const validGuessSet = new Set<string>([...VALID_GUESSES, ...ANSWERS]);

/** A random answer for free play. */
export function randomAnswer(): string {
  return ANSWERS[Math.floor(Math.random() * ANSWERS.length)] ?? "STARE";
}

/**
 * Deterministic answer for a given seed. Every player handed the same seed (the
 * same calendar day) gets the same word.
 */
export function answerForSeed(seed: number): string {
  if (ANSWERS.length === 0) return "STARE";
  const idx = ((seed % ANSWERS.length) + ANSWERS.length) % ANSWERS.length;
  return ANSWERS[idx];
}

/** Is this a word we accept as a guess? */
export function isValidGuess(word: string): boolean {
  return validGuessSet.has(word.toUpperCase());
}

export { answerSet };
