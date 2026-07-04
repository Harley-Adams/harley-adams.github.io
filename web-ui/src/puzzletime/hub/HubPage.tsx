/*
 * HubPage — the PuzzleTime landing screen: title + tagline, a daily hero, and a
 * category grid of playable puzzles. Only Wordle is live today; the rest are
 * shown as "coming soon" placeholders mirroring the iOS category set.
 */
import React from "react";
import { Link } from "react-router-dom";
import { dailyNumber } from "../lib/seed";

interface Category {
  key: string;
  name: string;
  blurb: string;
  accent: string;
  to?: string;
}

const CATEGORIES: Category[] = [
  {
    key: "wordle",
    name: "Wordle",
    blurb: "Guess the 5-letter word in six tries.",
    accent: "var(--pt-word)",
    to: "/wordle",
  },
  {
    key: "spatial",
    name: "Spatial",
    blurb: "Shape and grid puzzles.",
    accent: "var(--pt-spatial)",
  },
  {
    key: "numeric",
    name: "Numeric",
    blurb: "Number games and logic math.",
    accent: "var(--pt-numeric)",
  },
  {
    key: "logic",
    name: "Logic",
    blurb: "Deduction and reasoning puzzles.",
    accent: "var(--pt-logic)",
  },
];

export default function HubPage() {
  return (
    <div className="pt-hub">
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
        {CATEGORIES.map((c) =>
          c.to ? (
            <Link
              key={c.key}
              to={c.to}
              className="pt-cat-card"
              style={{ ["--accent" as string]: c.accent }}
            >
              <span className="pt-cat-dot" />
              <span className="pt-cat-name">{c.name}</span>
              <span className="pt-cat-blurb">{c.blurb}</span>
            </Link>
          ) : (
            <div
              key={c.key}
              className="pt-cat-card pt-cat-soon"
              style={{ ["--accent" as string]: c.accent }}
            >
              <span className="pt-cat-dot" />
              <span className="pt-cat-name">{c.name}</span>
              <span className="pt-cat-blurb">{c.blurb}</span>
              <span className="pt-cat-badge">Coming soon</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
