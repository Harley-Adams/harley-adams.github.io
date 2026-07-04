/*
 * Deterministic winner resolution — a direct port of the iOS MatchResolver so
 * both clients compute the SAME winner from the same snapshots, independent of
 * who is "local" or of array order. That symmetry is what stops both clients
 * crowning themselves on a tie.
 *
 * Order, best first:
 *   1. scoring metric (for firstToFinish, all solvers qualify equally),
 *   2. earlier finishedAt wins,
 *   3. lower entity id wins — the final deterministic breaker.
 * Returns null for a genuine draw.
 */
import { MatchPlayerId, OpponentSnapshot, START_SNAPSHOT } from "./snapshot";

export type MatchScoring = "firstToFinish";

export function decideWinner(
  players: MatchPlayerId[],
  snapshots: Record<MatchPlayerId, OpponentSnapshot | undefined>
): MatchPlayerId | null {
  const snap = (id: MatchPlayerId) => snapshots[id] ?? START_SNAPSHOT;

  // firstToFinish: anyone finished-and-solved is a candidate; the tie-break
  // picks who was actually first.
  const candidates = players.filter((id) => snap(id).didWin);
  if (candidates.length === 0) return null;

  let best: MatchPlayerId | null = null;
  for (const id of candidates) {
    if (best === null) {
      best = id;
      continue;
    }
    const ta = snap(id).finishedAt ?? Number.MAX_VALUE;
    const tb = snap(best).finishedAt ?? Number.MAX_VALUE;
    if (ta !== tb) {
      if (ta < tb) best = id;
    } else if (id < best) {
      best = id;
    }
  }
  return best;
}
