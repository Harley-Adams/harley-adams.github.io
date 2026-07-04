/*
 * HubPage — the PuzzleTime landing screen: an auth chip, title + tagline, a
 * daily hero, and a grid of modes (Wordle, Versus, Leaderboard).
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { dailyNumber } from "../lib/seed";
import { useAuth } from "../auth/AuthContext";
import SignInModal from "../auth/SignInModal";

interface Mode {
  key: string;
  name: string;
  blurb: string;
  accent: string;
  to: string;
}

const MODES: Mode[] = [
  {
    key: "wordle",
    name: "Wordle",
    blurb: "Guess the 5-letter word in six tries.",
    accent: "var(--pt-word)",
    to: "/wordle",
  },
  {
    key: "versus",
    name: "Versus",
    blurb: "Race others to solve the same word.",
    accent: "var(--pt-spatial)",
    to: "/versus",
  },
  {
    key: "leaderboard",
    name: "Leaderboards",
    blurb: "See who's on top across the world.",
    accent: "var(--pt-numeric)",
    to: "/leaderboard",
  },
];

function AuthChip({ onSignIn }: { onSignIn: () => void }) {
  const { session, signOut } = useAuth();
  if (session) {
    return (
      <div className="pt-auth-chip">
        <span className="pt-auth-name">{session.displayName}</span>
        <button className="pt-auth-link" onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }
  return (
    <button className="pt-auth-chip pt-auth-signin" onClick={onSignIn}>
      Sign in
    </button>
  );
}

export default function HubPage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="pt-hub">
      <div className="pt-hub-top">
        <AuthChip onSignIn={() => setShowSignIn(true)} />
      </div>

      <header className="pt-hub-head">
        <h1 className="pt-hub-title">PuzzleTime</h1>
        <p className="pt-hub-tagline">A daily puzzle break.</p>
      </header>

      <Link to="/wordle/daily" className="pt-daily-hero">
        <div className="pt-daily-kicker">Daily Wordle</div>
        <div className="pt-daily-no">#{dailyNumber()}</div>
        <div className="pt-daily-cta">Play today’s puzzle →</div>
      </Link>

      <div className="pt-cat-grid">
        {MODES.map((m) => (
          <Link
            key={m.key}
            to={m.to}
            className="pt-cat-card"
            style={{ ["--accent" as string]: m.accent }}
          >
            <span className="pt-cat-dot" />
            <span className="pt-cat-name">{m.name}</span>
            <span className="pt-cat-blurb">{m.blurb}</span>
          </Link>
        ))}
      </div>

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </div>
  );
}
