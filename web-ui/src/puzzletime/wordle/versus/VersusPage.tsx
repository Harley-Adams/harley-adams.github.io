/*
 * VersusPage — the multiplayer UI. Requires sign-in, then offers Quick Match
 * (matchmaking) or a private game (create + share a code, or join by code).
 * During play it shows the local board + keyboard alongside opponents' color-
 * only boards, then the result. Cross-compatible with the iOS PuzzleTime app.
 */
import React, { useState } from "react";
import Scaffold from "../../components/Scaffold";
import Board from "../Board";
import Keyboard from "../Keyboard";
import OpponentBoard from "./OpponentBoard";
import SignInModal from "../../auth/SignInModal";
import { useAuth } from "../../auth/AuthContext";
import { useVersus, VersusController } from "./useVersus";
import { PubSubState } from "../../net/pubsub";

const ACCENT = "var(--pt-spatial)";

export default function VersusPage() {
  const { session } = useAuth();
  if (!session) return <VersusSignIn />;
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
  const v = useVersus();

  const useKeyboardHandlers = v.phase === "playing";
  React.useEffect(() => {
    if (!useKeyboardHandlers) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") v.submit();
      else if (e.key === "Backspace") v.backspace();
      else if (/^[a-zA-Z]$/.test(e.key)) v.typeLetter(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [useKeyboardHandlers, v]);

  return (
    <Scaffold title="Versus" accent={ACCENT}>
      <div className="pt-versus">
        {v.error && <div className="pt-form-error">{v.error}</div>}
        {v.phase === "idle" && <ModeSelect v={v} />}
        {v.phase === "searching" && <Searching v={v} />}
        {v.phase === "connecting" && <Status text={v.statusText} />}
        {v.phase === "waiting" && <WaitingRoom v={v} />}
        {(v.phase === "playing" || v.phase === "over") && <Race v={v} />}
      </div>
    </Scaffold>
  );
}

function ModeSelect({ v }: { v: VersusController }) {
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState("");
  return (
    <div className="pt-browsing">
      <button
        className="pt-share-btn"
        style={{ background: ACCENT }}
        onClick={v.quickMatch}
      >
        Quick Match
      </button>
      <button className="pt-lobby-row" onClick={v.createPrivate}>
        <span className="pt-lobby-name">Create private game</span>
        <span className="pt-lobby-count">share a code →</span>
      </button>
      {!showJoin ? (
        <button className="pt-lobby-row" onClick={() => setShowJoin(true)}>
          <span className="pt-lobby-name">Join with a code</span>
        </button>
      ) : (
        <div className="pt-signin-form">
          <textarea
            className="pt-input"
            placeholder="Paste game code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={2}
          />
          <button
            className="pt-share-btn"
            style={{ background: ACCENT }}
            onClick={() => v.joinPrivate(code)}
          >
            Join game
          </button>
        </div>
      )}
    </div>
  );
}

function Searching({ v }: { v: VersusController }) {
  return (
    <div className="pt-waiting">
      <Status text={v.statusText || "Finding an opponent…"} />
      <button className="pt-lobby-row" onClick={v.leave}>
        <span className="pt-lobby-name">Cancel</span>
      </button>
    </div>
  );
}

function WaitingRoom({ v }: { v: VersusController }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!v.roomCode) return;
    try {
      await navigator.clipboard.writeText(v.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the code is still selectable below */
    }
  };
  return (
    <div className="pt-waiting">
      <Status text={v.statusText} />
      <p className="pt-lb-status">
        Share this code with a friend (works with the iOS app too):
      </p>
      <textarea className="pt-input" readOnly value={v.roomCode ?? ""} rows={3} />
      <button
        className="pt-share-btn"
        style={{ background: ACCENT }}
        onClick={copy}
      >
        {copied ? "Copied!" : "Copy code"}
      </button>
      <button className="pt-lobby-row" onClick={v.leave}>
        <span className="pt-lobby-name">Cancel</span>
      </button>
    </div>
  );
}

function Status({ text }: { text: string }) {
  return <div className="pt-lb-status">{text}</div>;
}

const CONN_META: Record<
  PubSubState,
  { label: string; cls: string; title: string }
> = {
  connecting: {
    label: "Connecting…",
    cls: "is-connecting",
    title: "Opening the realtime connection.",
  },
  live: {
    label: "Live",
    cls: "is-live",
    title: "Realtime connection active — opponent updates arrive instantly.",
  },
  reconnecting: {
    label: "Reconnecting…",
    cls: "is-reconnecting",
    title: "Lost the realtime connection; reconnecting. Updates are polled meanwhile.",
  },
  offline: {
    label: "Polling",
    cls: "is-offline",
    title: "Realtime connection unavailable — falling back to periodic polling.",
  },
};

function ConnectionBadge({ state }: { state: PubSubState }) {
  const meta = CONN_META[state];
  return (
    <div className={`pt-conn ${meta.cls}`} title={meta.title}>
      <span className="pt-conn-dot" />
      {meta.label}
    </div>
  );
}

function Race({ v }: { v: VersusController }) {
  return (
    <div className="pt-race">
      <div className="pt-conn-row">
        <ConnectionBadge state={v.connectionState} />
        {v.throttled && (
          <div
            className="pt-throttle"
            title="PlayFab is rate-limiting our requests. Live updates may lag for a moment; they'll catch up automatically."
          >
            <span className="pt-throttle-dot" />
            Rate limited — updates may lag briefly
          </div>
        )}
      </div>
      {v.isOver && (
        <div
          className="pt-versus-banner"
          style={{
            borderColor: v.didWin
              ? "var(--pt-success)"
              : v.isDraw
              ? "var(--pt-text-secondary)"
              : "var(--pt-danger)",
          }}
        >
          {v.didWin
            ? "You win! 🎉"
            : v.isDraw
            ? "Draw"
            : "Opponent won"}
          {v.answer && ` — ${v.answer}`}
        </div>
      )}
      <div className="pt-race-main">
        <div className="pt-race-me">
          <Board guesses={v.board.guesses} shakeRow={v.board.shakeRow} />
        </div>
        <div className="pt-race-opponents">
          {v.opponents.length === 0 && (
            <div className="pt-mini-label">Waiting for opponent…</div>
          )}
          {v.opponents.map((o, i) => (
            <OpponentBoard
              key={o.id}
              name={`Opponent ${i + 1}`}
              rows={o.snapshot.rows}
              solved={o.snapshot.didWin}
            />
          ))}
        </div>
      </div>
      {v.phase === "playing" ? (
        <Keyboard
          keyStates={v.board.keyStates}
          onLetter={v.typeLetter}
          onEnter={v.submit}
          onBackspace={v.backspace}
        />
      ) : (
        <button
          className="pt-share-btn"
          style={{ background: ACCENT }}
          onClick={v.leave}
        >
          Back to menu
        </button>
      )}
    </div>
  );
}
