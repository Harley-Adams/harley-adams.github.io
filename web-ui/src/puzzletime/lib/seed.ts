/*
 * Deterministic daily seeding. Mirrors the iOS app's approach: hash a stable
 * day-key string with FNV-1a, then index the answer pool by the seed. Everyone
 * playing on the same calendar day gets the same word — no backend involved.
 */

/** Stable 32-bit FNV-1a hash of a string. */
export function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // hash *= 16777619, kept in 32-bit unsigned space.
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Local calendar day as `YYYY-MM-DD`. */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The seed for today's (or a given day's) daily puzzle. */
export function dailySeed(date: Date = new Date()): number {
  return fnv1a(dayKey(date));
}

/** A friendly, monotonically-increasing "Daily #N" number from a launch epoch. */
export function dailyNumber(date: Date = new Date()): number {
  const epoch = Date.UTC(2026, 0, 1); // Jan 1 2026 = Daily #1
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((today - epoch) / 86_400_000) + 1;
}
