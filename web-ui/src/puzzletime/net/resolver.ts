/*
 * Deterministic winner resolution — a direct port of the iOS MatchResolver so
 * both clients compute the SAME winner from the same snapshots, independent of
 * who is "local" or of array order. That symmetry is what stops both clients
 * crowning themselves on a tie.
 *
 * Order, best first:
 *   1. scoring metric (lower is better),
 *   2. earlier finishedAt wins,
 *   3. lower entity id wins — the final deterministic breaker.
 * Returns null for a genuine draw.
 *
 * Modes:
 *   - firstToFinish: any solver qualifies equally; the tie-break (time, id)
 *     picks who was actually first.
 *   - guessRace: the fewest-guesses winner — whoever solved in the fewest
 *     `stepsTaken` wins, ties broken by finish time then id. Pairs with the
 *     "equalize guesses" end condition in useVersus so the trailing player
 *     always gets an equal number of guesses before we compare.
 */
import { MatchPlayerId, OpponentSnapshot, START_SNAPSHOT } from "./snapshot";

export type MatchScoring = "firstToFinish" | "guessRace";

export function decideWinner(
  players: MatchPlayerId[],
  snapshots: Record<MatchPlayerId, OpponentSnapshot | undefined>,
  scoring: MatchScoring = "guessRace"
): MatchPlayerId | null {
  const snap = (id: MatchPlayerId) => snapshots[id] ?? START_SNAPSHOT;

  // Only solvers can win; the metric ("lower is better") ranks them.
  const candidates = players.filter((id) => snap(id).didWin);
  if (candidates.length === 0) return null;

  // firstToFinish treats every solver equally (metric 0) so the finish-time
  // tie-break decides; guessRace ranks by guess count first.
  const metric = (id: MatchPlayerId) =>
    scoring === "guessRace" ? snap(id).stepsTaken : 0;

  let best: MatchPlayerId | null = null;
  for (const id of candidates) {
    if (best === null) {
      best = id;
      continue;
    }
    const ma = metric(id);
    const mb = metric(best);
    if (ma !== mb) {
      if (ma < mb) best = id;
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
