/*
 * Typed network errors. RateLimitError is thrown when PlayFab returns HTTP 429
 * so callers can back off and surface a "we're being throttled" signal in the
 * UI instead of silently stalling.
 */
export class RateLimitError extends Error {
  /** Suggested wait before retrying, in milliseconds. */
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super("Rate limited (HTTP 429)");
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}
