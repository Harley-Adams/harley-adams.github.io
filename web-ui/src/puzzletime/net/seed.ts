/*
 * Deterministic shared-word derivation. Both iOS and web feed the same seed
 * string (a matchId for Quick Match, or a lobbyId for a private lobby) through
 * an identical FNV-1a 64-bit hash and pick answers[hash % answers.length]. This
 * is the cross-play contract — the two clients must resolve the SAME word from
 * the same seed, so nothing about the word ever needs to cross the wire.
 *
 * Parity with the iOS SimRNG.hash + WordList.answer(forSeed:) is verified: the
 * hash uses 64-bit wraparound arithmetic (matching Swift's &* / &^ operators),
 * implemented here with BigInt masked to 64 bits.
 */
import { VERSUS_ANSWERS } from "../wordle/data/versusAnswers";

const MASK64 = (1n << 64n) - 1n;
const FNV_OFFSET = 1469598103934665603n;
const FNV_PRIME = 1099511628211n;

/** FNV-1a over the UTF-8 bytes of `input`, with 64-bit wraparound. */
export function fnv1a64(input: string): bigint {
  let h = FNV_OFFSET;
  const bytes = new TextEncoder().encode(input);
  for (const b of bytes) {
    h = (h ^ BigInt(b)) & MASK64;
    h = (h * FNV_PRIME) & MASK64;
  }
  return h;
}

/** The shared versus answer for a seed string (matchId or lobbyId). */
export function answerForSeed(seed: string): string {
  const answers = VERSUS_ANSWERS;
  if (answers.length === 0) return "STARE";
  const idx = Number(fnv1a64(seed) % BigInt(answers.length));
  return answers[idx];
}
