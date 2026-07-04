/*
 * The cross-play state contract. An OpponentSnapshot is the obfuscated view of a
 * player's progress that everyone else is allowed to see — colors only, never
 * letters — plus the metadata needed to rank finishers identically on every
 * client. SnapshotWire is its compact, JSON-safe form written into PlayFab lobby
 * member data under the key "snap" with SORTED keys, byte-identical to the iOS
 * SnapshotWire so iOS and web read each other's snapshots.
 *
 * Mark codes (must match iOS): correct=0, present=1, absent=2, neutral=3.
 */

export type ProgressMark = 0 | 1 | 2 | 3; // correct | present | absent | neutral

export const MARK = {
  correct: 0 as ProgressMark,
  present: 1 as ProgressMark,
  absent: 2 as ProgressMark,
  neutral: 3 as ProgressMark,
};

export type MatchPlayerId = string;

export interface OpponentSnapshot {
  progress: number; // 0..1
  stepsTaken: number; // guesses made
  isFinished: boolean;
  didWin: boolean;
  /** Owner's match-clock seconds at finish. Drives the shared tie-break. */
  finishedAt: number | null;
  /** columns for the blurred grid (0 = no grid). */
  cols: number;
  /** marks per row (color codes only). */
  rows: ProgressMark[][];
  /** End-of-match reveal (e.g. the answer), published only once over. */
  revealedItems: string[] | null;
}

export const START_SNAPSHOT: OpponentSnapshot = {
  progress: 0,
  stepsTaken: 0,
  isFinished: false,
  didWin: false,
  finishedAt: null,
  cols: 0,
  rows: [],
  revealedItems: null,
};

/* ---- Wire form (sorted-key JSON, matches iOS SnapshotWire) --------------- */

interface Wire {
  cols: number;
  f: boolean; // isFinished
  p: number; // progress
  rev?: string[] | null;
  rows: number[][];
  s: number; // stepsTaken
  t?: number | null; // finishedAt
  w: boolean; // didWin
}

/** Serialize a snapshot to the exact sorted-key JSON iOS emits. */
export function encodeSnapshot(snap: OpponentSnapshot): string {
  // Keys are written in sorted order to match Swift's `.sortedKeys` output, so
  // an unchanged state always serializes to the identical string (lets us skip
  // redundant UpdateLobby calls and stay under the rate limit).
  const wire: Wire = {
    cols: snap.cols,
    f: snap.isFinished,
    p: snap.progress,
    rev: snap.revealedItems ?? undefined,
    rows: snap.rows,
    s: snap.stepsTaken,
    t: snap.finishedAt ?? undefined,
    w: snap.didWin,
  };
  return stableStringify(wire);
}

export function decodeSnapshot(json: string): OpponentSnapshot | null {
  try {
    const w = JSON.parse(json) as Wire;
    return {
      progress: w.p ?? 0,
      stepsTaken: w.s ?? 0,
      isFinished: !!w.f,
      didWin: !!w.w,
      finishedAt: w.t ?? null,
      cols: w.cols ?? 0,
      rows: (w.rows ?? []) as ProgressMark[][],
      revealedItems: w.rev ?? null,
    };
  } catch {
    return null;
  }
}

/** JSON with object keys emitted in sorted order at every level. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",")}}`;
}
