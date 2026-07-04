/*
 * VersusPage — the multiplayer race UI. Requires sign-in, then walks through
 * lobby browsing, a waiting room, the live race (my board + keyboard alongside
 * opponents' color-only boards), and the results standings.
 */
import React, { useEffect, useState } from "react";
import Scaffold from "../../components/Scaffold";
import Board from "../Board";
import Keyboard from "../Keyboard";
import OpponentBoard from "./OpponentBoard";
import SignInModal from "../../auth/SignInModal";
import { useAuth } from "../../auth/AuthContext";
import { useVersus } from "./useVersus";

const ACCENT = "var(--pt-spatial)";

export default function VersusPage() {
  const { session } = useAuth();

  if (!session) {
    return <VersusSignIn />;
  }
  return <VersusGame key={session.playFabId} />;
}

function VersusSignIn() {
  const [show, setShow] = useState(true);
  return (
    <Scaffold title="Versus" accent={ACCENT}>
      <div className="pt-lb-empty">
        <p>Sign in with a display name to play live against others.</p>
        <button
          className="pt-share-btn"
          style={{ background: ACCENT }}
          onClick={() => setShow(true)}
        >
          Sign in
        </button>
      </div>
      {show && <SignInModal onClose={() => setShow(false)} />}
    </Scaffold>
  );
}

function VersusGame() {
  const { session } = useAuth();
  const v = useVersus(session!);

  // Load the lobby list once when browsing begins.
  useEffect(() => {
    if (v.phase === "browsing") v.refreshLobbies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Physical keyboard during the race.
  useEffect(() => {
    if (v.phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") v.submit();
      else if (e.key === "Backspace") v.backspace();
      else if (/^[a-zA-Z]$/.test(e.key)) v.typeLetter(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [v]);

  const title =
    v.phase === "playing" || v.phase === "results" ? "Versus" : "Find a match";

  return (
    <Scaffold
      title={title}
      accent={ACCENT}
      onNew={v.phase === "browsing" ? () => v.refreshLobbies() : () => v.leave()}
      newLabel={v.phase === "browsing" ? "Refresh" : "Leave match"}
    >
      <div className="pt-versus">
        {v.error && <div className="pt-form-error">{v.error}</div>}
        {v.status && <div className="pt-lb-status">{v.status}</div>}

        {v.phase === "browsing" && (
          <Browsing lobbies={v.lobbies} onJoin={v.join} onCreate={v.create} />
        )}

        {v.phase === "lobby" && (
          <WaitingRoom
            roster={v.roster.map((r) => r.name)}
            isHost={v.isHost}
            onStart={v.start}
          />
        )}

        {(v.phase === "playing" || v.phase === "results") && (
          <Race v={v} />
        )}
      </div>
    </Scaffold>
  );
}

function Browsing({
  lobbies,
  onJoin,
  onCreate,
}: {
  lobbies: { LobbyId: string; ConnectionString: string; CurrentPlayers: number; MaxPlayers: number }[];
  onJoin: (conn: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="pt-browsing">
      <button className="pt-share-btn" style={{ background: ACCENT }} onClick={onCreate}>
        Create match
      </button>
      <div className="pt-lobby-list">
        {lobbies.map((l) => (
          <button
            key={l.LobbyId}
            className="pt-lobby-row"
            onClick={() => onJoin(l.ConnectionString)}
          >
            <span className="pt-lobby-name">Match {l.LobbyId.slice(0, 6)}</span>
            <span className="pt-lobby-count">
              {l.CurrentPlayers}/{l.MaxPlayers}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function WaitingRoom({
  roster,
  isHost,
  onStart,
}: {
  roster: string[];
  isHost: boolean;
  onStart: () => void;
}) {
  return (
    <div className="pt-waiting">
      <h3 className="pt-guide-h3">Players ({roster.length})</h3>
      <ul className="pt-roster">
        {roster.map((name, i) => (
          <li key={i} className="pt-roster-item">
            {name}
          </li>
        ))}
      </ul>
      {isHost ? (
        <button className="pt-share-btn" style={{ background: ACCENT }} onClick={onStart}>
          Start match
        </button>
      ) : (
        <p className="pt-lb-status">Waiting for the host to start…</p>
      )}
    </div>
  );
}

function Race({ v }: { v: ReturnType<typeof useVersus> }) {
  const sorted = [...v.opponents].sort((a, b) => {
    if (a.solved !== b.solved) return a.solved ? -1 : 1;
    return b.guessCount - a.guessCount;
  });

  return (
    <div className="pt-race">
      {v.phase === "results" && (
        <div className="pt-versus-banner" style={{ borderColor: ACCENT }}>
          {v.iWon ? "🏆 You won!" : `${v.winnerName} won this round`}
        </div>
      )}

      <div className="pt-race-main">
        <div className="pt-race-me">
          <Board guesses={v.board.guesses} shakeRow={v.board.shakeRow} />
          <Keyboard
            keyStates={v.board.keyStates}
            onLetter={v.typeLetter}
            onEnter={v.submit}
            onBackspace={v.backspace}
          />
        </div>

        {sorted.length > 0 && (
          <div className="pt-race-opponents">
            {sorted.map((o) => (
              <OpponentBoard
                key={o.entityId}
                name={o.name}
                states={o.states}
                solved={o.solved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
