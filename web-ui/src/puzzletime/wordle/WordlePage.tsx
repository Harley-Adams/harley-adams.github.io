/*
 * WordlePage — wires the useWordle controller to the Scaffold, Board, Keyboard,
 * and the help/stats sheets. Handles physical-keyboard input and the end banner.
 */
import React, { useCallback, useEffect, useState } from "react";
import Scaffold from "../components/Scaffold";
import Board from "./Board";
import Keyboard from "./Keyboard";
import HelpModal from "./HelpModal";
import StatsModal from "./StatsModal";
import { useWordle, WordleMode } from "./useWordle";

const ACCENT = "var(--pt-word)";

export default function WordlePage({ mode }: { mode: WordleMode }) {
  const game = useWordle(mode);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const finished = game.state.status !== "playing";

  // Physical keyboard support.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showHelp || showStats) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") {
        game.submit();
      } else if (e.key === "Backspace") {
        game.backspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        game.typeLetter(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game, showHelp, showStats]);

  // Surface the stats sheet a beat after a game ends.
  useEffect(() => {
    if (!finished) return;
    const t = setTimeout(() => setShowStats(true), 1400);
    return () => clearTimeout(t);
  }, [finished]);

  const title = mode === "daily" ? `Daily #${game.dailyNo}` : "Wordle";
  const dismissToast = useCallback(() => game.dismissToast(), [game]);

  return (
    <Scaffold
      title={title}
      accent={ACCENT}
      toast={game.toast}
      onToastDone={dismissToast}
      onHint={game.hint}
      onHelp={() => setShowHelp(true)}
      onStats={() => setShowStats(true)}
      onNew={game.newGame}
      newLabel={mode === "daily" ? "Retry today" : "New game"}
    >
      <div className="pt-wordle">
        <div className={`pt-message${game.state.message ? " pt-message-show" : ""}`}>
          {game.state.message ?? "\u00a0"}
        </div>
        <Board guesses={game.state.guesses} shakeRow={game.state.shakeRow} />
        <Keyboard
          keyStates={game.state.keyStates}
          onLetter={game.typeLetter}
          onEnter={game.submit}
          onBackspace={game.backspace}
        />
      </div>

      {showHelp && <HelpModal accent={ACCENT} onClose={() => setShowHelp(false)} />}
      {showStats && (
        <StatsModal
          accent={ACCENT}
          stats={game.stats}
          isDaily={mode === "daily"}
          finished={finished}
          highlightRow={game.state.status === "won" ? game.state.currentRow : null}
          onShare={game.shareText}
          onClose={() => setShowStats(false)}
        />
      )}
    </Scaffold>
  );
}
