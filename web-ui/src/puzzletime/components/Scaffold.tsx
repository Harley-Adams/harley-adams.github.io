/*
 * PuzzleScaffold — the frame every puzzle lives in, ported from the iOS
 * PuzzleScaffold. Owns the nav bar chrome (back · title · hint · stats · help ·
 * overflow) and a transient top toast, leaving the thumb zone for game input.
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BackIcon,
  HelpIcon,
  HintIcon,
  MoreIcon,
  StatsIcon,
} from "./icons";

interface ScaffoldProps {
  title: string;
  accent: string;
  toast?: string | null;
  onToastDone?: () => void;
  onHint?: () => void;
  onHelp: () => void;
  onStats: () => void;
  onNew: () => void;
  newLabel?: string;
  children: React.ReactNode;
}

export default function Scaffold({
  title,
  accent,
  toast,
  onToastDone,
  onHint,
  onHelp,
  onStats,
  onNew,
  newLabel = "New game",
  children,
}: ScaffoldProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  // Auto-dismiss the toast (~1.8s), matching the iOS timing.
  useEffect(() => {
    if (!toast || !onToastDone) return;
    const t = setTimeout(onToastDone, 1800);
    return () => clearTimeout(t);
  }, [toast, onToastDone]);

  return (
    <div className="pt-scaffold" style={{ ["--accent" as string]: accent }}>
      <nav className="pt-navbar" aria-label="Puzzle">
        <Link to="/" className="pt-icon-btn" aria-label="Back to PuzzleTime">
          <BackIcon />
        </Link>
        <span className="pt-nav-title">{title}</span>
        <div className="pt-nav-actions">
          {onHint && (
            <button className="pt-icon-btn pt-accent" onClick={onHint} aria-label="Hint">
              <HintIcon />
            </button>
          )}
          <button className="pt-icon-btn pt-accent" onClick={onStats} aria-label="Statistics">
            <StatsIcon />
          </button>
          <button className="pt-icon-btn pt-accent" onClick={onHelp} aria-label="How to play">
            <HelpIcon />
          </button>
          <div className="pt-menu-wrap" ref={menuRef}>
            <button
              className="pt-icon-btn pt-accent"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="More"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <MoreIcon />
            </button>
            {menuOpen && (
              <div className="pt-menu" role="menu">
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onNew();
                  }}
                >
                  {newLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {toast && (
        <div className="pt-toast" role="status">
          {toast}
        </div>
      )}

      <main className="pt-puzzle-body">{children}</main>
    </div>
  );
}
