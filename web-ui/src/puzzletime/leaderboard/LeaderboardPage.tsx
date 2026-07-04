/*
 * LeaderboardPage — tabbed global leaderboards (wins, streak, versus wins) drawn
 * from PlayFab. Requires sign-in; prompts for it otherwise.
 */
import React, { useCallback, useEffect, useState } from "react";
import Scaffold from "../components/Scaffold";
import SignInModal from "../auth/SignInModal";
import { useAuth } from "../auth/AuthContext";
import { LEADERBOARDS, fetchLeaderboard } from "../net/stats";
import { LeaderboardEntry } from "../net/types";

const ACCENT = "var(--pt-word)";

export default function LeaderboardPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState(0);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);

  const board = LEADERBOARDS[tab];

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setEntries(await fetchLeaderboard(session, board.statistic));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load leaderboard.");
    } finally {
      setLoading(false);
    }
  }, [session, board.statistic]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Scaffold
      title="Leaderboards"
      accent={ACCENT}
      onNew={() => load()}
      newLabel="Refresh"
    >
      <div className="pt-leaderboard">
        {!session ? (
          <div className="pt-lb-empty">
            <p>Sign in to see how you rank against other players.</p>
            <button
              className="pt-share-btn"
              style={{ background: ACCENT }}
              onClick={() => setShowSignIn(true)}
            >
              Sign in
            </button>
          </div>
        ) : (
          <>
            <div className="pt-lb-tabs">
              {LEADERBOARDS.map((lb, i) => (
                <button
                  key={lb.statistic}
                  className={`pt-lb-tab${i === tab ? " pt-lb-tab-active" : ""}`}
                  onClick={() => setTab(i)}
                >
                  {lb.label}
                </button>
              ))}
            </div>

            {loading && <div className="pt-lb-status">Loading…</div>}
            {error && <div className="pt-form-error">{error}</div>}
            {!loading && !error && entries.length === 0 && (
              <div className="pt-lb-status">
                No scores yet — be the first to play a game!
              </div>
            )}

            <ol className="pt-lb-list">
              {entries.map((e) => {
                const me = e.PlayFabId === session.playFabId;
                return (
                  <li
                    key={e.PlayFabId}
                    className={`pt-lb-row${me ? " pt-lb-row-me" : ""}`}
                  >
                    <span className="pt-lb-rank">{e.Position + 1}</span>
                    <span className="pt-lb-name">
                      {e.DisplayName || "Anonymous"}
                      {me && <span className="pt-lb-you"> (you)</span>}
                    </span>
                    <span className="pt-lb-value">
                      {e.StatValue} {board.unit}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} onSignedIn={load} />}
    </Scaffold>
  );
}
