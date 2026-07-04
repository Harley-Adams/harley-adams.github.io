/*
 * useVersus — realtime multiplayer Wordle on PlayFab, cross-compatible with the
 * iOS PuzzleTime app. Two entry paths, both landing in a shared lobby whose
 * per-member "snap" data relays each player's obfuscated progress:
 *
 *   - Quick Match: matchmaking on the shared `versus_wordle` queue → arranged
 *     lobby. The word is derived from the matchId (never broadcast).
 *   - Private lobby: host creates a lobby and shares its connection string as a
 *     room code; a friend joins with it. The word is derived from the lobbyId.
 *
 * The winner is decided by the shared, order-independent resolver so both
 * clients agree. Opponent progress is colors only — letters never cross the wire.
 */
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  GameStatus,
  LetterCell,
  LetterState,
  MAX_GUESSES,
  WORD_LENGTH,
  emptyGuess,
  mergeKeyState,
  scoreGuess,
} from "../engine";
import { isValidGuess } from "../words";
import { useAuth } from "../../auth/AuthContext";
import { answerForSeed } from "../../net/seed";
import {
  MARK,
  OpponentSnapshot,
  ProgressMark,
  START_SNAPSHOT,
  decodeSnapshot,
  encodeSnapshot,
} from "../../net/snapshot";
import { decideWinner } from "../../net/resolver";
import {
  cancelAllTickets,
  createTicket,
  getArrangementString,
  pollTicket,
  WORDLE_QUEUE,
} from "../../net/matchmaking";
import {
  createLobby,
  getLobbyMemberIds,
  getLobbySnapshots,
  joinArrangedLobby,
  joinLobby,
  leaveLobby,
  publishSnapshot,
} from "../../net/lobby";
import { PlayFabPubSub, PubSubState, LobbyMemberChange } from "../../net/pubsub";
import { RateLimitError } from "../../net/errors";
import { EntityKey, EntityTokenResponse } from "../../net/types";
import { incrementVersusWins } from "../../lib/storage";
import { recordVersusWin } from "../../net/stats";

const PLAYER_COUNT = 2;
const MATCH_TIMEOUT_SECONDS = 30;

export type VersusPhase =
  | "idle"
  | "searching"
  | "connecting"
  | "waiting"
  | "playing"
  | "over";

/* ---- Local board (self-contained; mirrors the solo reducer) -------------- */

interface BoardState {
  answer: string;
  guesses: LetterCell[][];
  currentRow: number;
  currentColumn: number;
  status: GameStatus;
  keyStates: Record<string, LetterState>;
  message: string | null;
  shakeRow: number | null;
  submitted: string[];
}

type BoardAction =
  | { type: "TYPE"; letter: string }
  | { type: "BACKSPACE" }
  | { type: "SUBMIT" }
  | { type: "CLEAR_SHAKE" }
  | { type: "RESET"; answer: string };

function freshBoard(answer: string): BoardState {
  return {
    answer: answer.toUpperCase(),
    guesses: Array.from({ length: MAX_GUESSES }, () => emptyGuess()),
    currentRow: 0,
    currentColumn: 0,
    status: "playing",
    keyStates: {},
    message: null,
    shakeRow: null,
    submitted: [],
  };
}

function applyGuess(state: BoardState, word: string): BoardState {
  const states = scoreGuess(word, state.answer);
  const guesses = state.guesses.map((row) => row.slice());
  const keyStates = { ...state.keyStates };
  const chars = word.split("");
  for (let i = 0; i < WORD_LENGTH; i++) {
    guesses[state.currentRow][i] = { letter: chars[i], state: states[i] };
    keyStates[chars[i]] = mergeKeyState(keyStates[chars[i]], states[i]);
  }
  const submitted = [...state.submitted, word];
  if (word === state.answer) {
    return { ...state, guesses, keyStates, submitted, status: "won" };
  }
  if (state.currentRow === MAX_GUESSES - 1) {
    return { ...state, guesses, keyStates, submitted, status: "lost" };
  }
  return {
    ...state,
    guesses,
    keyStates,
    submitted,
    currentRow: state.currentRow + 1,
    currentColumn: 0,
    message: null,
  };
}

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "TYPE": {
      if (
        state.status !== "playing" ||
        state.currentColumn >= WORD_LENGTH ||
        state.currentRow >= MAX_GUESSES
      )
        return state;
      const upper = action.letter.toUpperCase();
      if (!/^[A-Z]$/.test(upper)) return state;
      const guesses = state.guesses.map((row) => row.slice());
      guesses[state.currentRow][state.currentColumn] = {
        letter: upper,
        state: "tbd",
      };
      return {
        ...state,
        guesses,
        currentColumn: state.currentColumn + 1,
        message: null,
      };
    }
    case "BACKSPACE": {
      if (state.status !== "playing" || state.currentColumn === 0) return state;
      const guesses = state.guesses.map((row) => row.slice());
      guesses[state.currentRow][state.currentColumn - 1] = {
        letter: null,
        state: "empty",
      };
      return {
        ...state,
        guesses,
        currentColumn: state.currentColumn - 1,
        message: null,
      };
    }
    case "SUBMIT": {
      if (state.status !== "playing") return state;
      if (state.currentColumn < WORD_LENGTH) {
        return { ...state, message: "Not enough letters", shakeRow: state.currentRow };
      }
      const word = state.guesses[state.currentRow]
        .map((c) => c.letter ?? "")
        .join("");
      if (!isValidGuess(word)) {
        return { ...state, message: "Not in word list", shakeRow: state.currentRow };
      }
      return applyGuess(state, word);
    }
    case "CLEAR_SHAKE":
      return { ...state, shakeRow: null };
    case "RESET":
      return freshBoard(action.answer);
    default:
      return state;
  }
}

/* ---- Snapshot derivation ------------------------------------------------- */

function markFor(state: LetterState): ProgressMark {
  switch (state) {
    case "correct":
      return MARK.correct;
    case "present":
      return MARK.present;
    case "absent":
      return MARK.absent;
    default:
      return MARK.neutral;
  }
}

function buildSnapshot(
  board: BoardState,
  finishedAt: number | null
): OpponentSnapshot {
  const rows: ProgressMark[][] = board.submitted.map((word) =>
    scoreGuess(word, board.answer).map(markFor)
  );
  let maxGreens = 0;
  for (const row of rows) {
    maxGreens = Math.max(maxGreens, row.filter((m) => m === MARK.correct).length);
  }
  const solved = board.status === "won";
  const finished = board.status !== "playing";
  return {
    progress: solved ? 1 : Math.min(0.95, maxGreens / WORD_LENGTH),
    stepsTaken: board.submitted.length,
    isFinished: finished,
    didWin: solved,
    finishedAt: finished ? finishedAt : null,
    cols: WORD_LENGTH,
    rows,
    revealedItems: finished ? [board.answer] : null,
  };
}

/* ---- Hook ---------------------------------------------------------------- */

export interface VersusController {
  phase: VersusPhase;
  error: string | null;
  statusText: string;
  board: BoardState;
  opponents: { id: string; snapshot: OpponentSnapshot }[];
  isOver: boolean;
  didWin: boolean;
  isDraw: boolean;
  answer: string | null;
  roomCode: string | null;
  memberCount: number;
  signedIn: boolean;
  throttled: boolean;
  connectionState: PubSubState;
  quickMatch: () => void;
  createPrivate: () => void;
  joinPrivate: (code: string) => void;
  typeLetter: (letter: string) => void;
  backspace: () => void;
  submit: () => void;
  leave: () => void;
}

export function useVersus(): VersusController {
  const { session } = useAuth();
  const [phase, setPhase] = useState<VersusPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(1);
  const [board, dispatch] = useReducer(boardReducer, freshBoard("STARE"));
  const [opponents, setOpponents] = useState<
    Record<string, OpponentSnapshot>
  >({});
  const [winnerId, setWinnerId] = useState<string | null | undefined>(undefined);
  // True while PlayFab is actively rate-limiting our lobby calls (429s). Drives
  // a small UI signal and a short relay backoff.
  const [throttled, setThrottled] = useState(false);
  // Live state of the realtime relay socket, for a connection indicator.
  const [connState, setConnState] = useState<PubSubState>("connecting");

  // Refs for the relay + lifecycle (avoid re-subscribing on every render).
  const boardRef = useRef(board);
  boardRef.current = board;
  const lobbyIdRef = useRef<string | null>(null);
  const startMsRef = useRef(0);
  const finishedAtRef = useRef<number | null>(null);
  const pubsubRef = useRef<PlayFabPubSub | null>(null);
  // Separate PubSub used only during Quick Match search (subscribes to the
  // matchmaking ticket so we're pushed the "Matched" event instead of polling).
  const searchPubsubRef = useRef<PlayFabPubSub | null>(null);
  const pendingFetchRef = useRef(false);
  const connectedRef = useRef(false);
  const lastPublishedRef = useRef("");
  const localIdRef = useRef<string>("");
  const relayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);
  const recordedWinRef = useRef(false);
  // While rate-limited, hold off all lobby calls until this timestamp.
  const backoffUntilRef = useRef(0);

  const tokenOf = (): EntityTokenResponse | null =>
    session ? session.entityToken : null;
  const entityOf = (): EntityKey | null =>
    session ? session.entityToken.Entity : null;

  const teardown = useCallback(async () => {
    cancelledRef.current = true;
    if (relayRef.current) {
      clearInterval(relayRef.current);
      relayRef.current = null;
    }
    const pubsub = pubsubRef.current;
    pubsubRef.current = null;
    if (pubsub) await pubsub.disconnect();
    const searchPubsub = searchPubsubRef.current;
    searchPubsubRef.current = null;
    if (searchPubsub) await searchPubsub.disconnect();
    const token = tokenOf();
    const entity = entityOf();
    if (token && entity && lobbyIdRef.current) {
      await leaveLobby(token, entity, lobbyIdRef.current);
    }
    if (token && entity && phaseRef.current === "searching") {
      await cancelAllTickets(token, entity);
    }
    lobbyIdRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const phaseRef = useRef<VersusPhase>(phase);
  phaseRef.current = phase;

  // Stamp finish time the moment the local board first finishes.
  useEffect(() => {
    if (board.status !== "playing" && finishedAtRef.current === null && startMsRef.current) {
      finishedAtRef.current = (Date.now() - startMsRef.current) / 1000;
    }
  }, [board.status]);

  // Auto-clear the invalid-guess shake.
  useEffect(() => {
    if (board.shakeRow === null) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_SHAKE" }), 600);
    return () => clearTimeout(t);
  }, [board.shakeRow]);

  /** Begin the shared match: reset the board to the derived word, connect the
   *  relay socket, and start publishing/fetching snapshots. */
  const beginMatch = useCallback(
    async (lobbyId: string, seed: string) => {
      const token = tokenOf();
      const entity = entityOf();
      if (!token || !entity) return;
      lobbyIdRef.current = lobbyId;
      localIdRef.current = entity.Id;
      finishedAtRef.current = null;
      lastPublishedRef.current = "";
      recordedWinRef.current = false;
      backoffUntilRef.current = 0;
      setThrottled(false);
      setOpponents({});
      setWinnerId(undefined);
      const answer = answerForSeed(seed);
      dispatch({ type: "RESET", answer });
      startMsRef.current = Date.now();
      setPhase("playing");
      setConnState("connecting");

      // Connect PubSub (time-boxed); fall back to polling if it stalls. The
      // onState callback drives both the UI indicator and the fallback-poll
      // gate (connectedRef is true only while the socket is genuinely live).
      const pubsub = new PlayFabPubSub();
      pubsubRef.current = pubsub;
      // Force one GetLobby on the first tick to load any snapshots members
      // published before we subscribed; after that the relay is push-driven.
      pendingFetchRef.current = true;
      const onState = (s: PubSubState) => {
        setConnState(s);
        connectedRef.current = s === "live";
      };
      // Apply lobby-change pushes directly: each carries the changed member's
      // full snapshot, so we merge opponents in place and never hit GetLobby on
      // the happy path. Our own echo is skipped (we already know our board), and
      // a null (unparsable push / possible membership change) falls back to a
      // GetLobby reconcile on the next tick.
      const applyChanges = (changes: LobbyMemberChange[] | null) => {
        if (changes === null) {
          pendingFetchRef.current = true;
          return;
        }
        const updates: Record<string, OpponentSnapshot> = {};
        for (const c of changes) {
          if (c.entityId === entity.Id) continue; // our own echo
          if (!c.snap) continue; // e.g. a member (re)subscribing — no board data
          const decoded = decodeSnapshot(c.snap);
          if (decoded) updates[c.entityId] = decoded;
        }
        if (Object.keys(updates).length > 0) {
          setOpponents((prev) => ({ ...prev, ...updates }));
          setThrottled(false); // a live push means we're healthy again
        }
      };
      const connectPromise = pubsub
        .connect(
          token,
          entity,
          { kind: "lobby", lobbyId },
          (e) => {
            if (e.kind === "lobby") applyChanges(e.changes);
          },
          onState
        )
        .catch(() => {
          connectedRef.current = false;
          setConnState("offline");
        });
      await Promise.race([
        connectPromise,
        new Promise((r) => setTimeout(r, 6000)),
      ]);

      // Relay loop. On the happy path this only *publishes* our own snapshot
      // when it changes — opponent state arrives via PubSub pushes and is
      // applied directly (see applyChanges above), so we don't call GetLobby at
      // all mid-match and stay well clear of the lobby rate limits (429s).
      // GetLobby ("reconcile") runs only when needed: the one-shot initial sync
      // on join, while the socket is down (fallback poll), a slow ~20s watchdog
      // in case a push is ever missed, and after a reconnect. Reconnects
      // re-subscribe (see pubsub.ts), so the healthy path stays push-driven.
      let ticks = 0;
      let lastFetchTick = -100;
      // Record a 429: back off all lobby calls and flag the UI.
      const noteThrottle = (e: unknown) => {
        if (e instanceof RateLimitError) {
          backoffUntilRef.current = Date.now() + e.retryAfterMs;
          setThrottled(true);
          return true;
        }
        return false;
      };
      relayRef.current = setInterval(async () => {
        if (cancelledRef.current) return;
        // While throttled, skip every lobby call until the backoff elapses so we
        // stop adding to the rate-limit pressure. Keep the UI signal on until
        // the next successful call clears it.
        if (Date.now() < backoffUntilRef.current) {
          ticks += 1;
          return;
        }
        const snap = buildSnapshot(boardRef.current, finishedAtRef.current);
        const json = encodeSnapshot(snap);
        if (json !== lastPublishedRef.current) {
          lastPublishedRef.current = json;
          try {
            await publishSnapshot(token, entity, lobbyId, json);
          } catch (e) {
            // On throttle, roll back so we retry this snapshot after the backoff.
            if (noteThrottle(e)) lastPublishedRef.current = "";
            /* other errors: transient — retried next tick */
          }
        }
        // GetLobby reconcile — only for initial sync, fallback while offline, or
        // the periodic watchdog. Pushes handle the steady state.
        const needReconcile = pendingFetchRef.current;
        const offlinePoll = !connectedRef.current && ticks % 3 === 0;
        const watchdog = ticks - lastFetchTick >= 20;
        if (needReconcile || offlinePoll || watchdog) {
          pendingFetchRef.current = false;
          lastFetchTick = ticks;
          try {
            const entries = await getLobbySnapshots(token, lobbyId);
            const next: Record<string, OpponentSnapshot> = {};
            for (const e of entries) {
              if (e.entityId === entity.Id) continue;
              const decoded = decodeSnapshot(e.snapshotJSON);
              if (decoded) next[e.entityId] = decoded;
            }
            setOpponents(next);
            setThrottled(false); // a clean read means we're no longer throttled
          } catch (e) {
            if (!noteThrottle(e)) pendingFetchRef.current = true; // retry non-429
          }
        }
        ticks += 1;
      }, 1000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session]
  );

  // Decide the winner whenever snapshots change. firstToFinish: as soon as any
  // player has solved, the earliest solver wins; if everyone's finished with no
  // solve, it's a draw.
  useEffect(() => {
    if (phase !== "playing") return;
    const localId = localIdRef.current;
    const localSnap = buildSnapshot(board, finishedAtRef.current);
    const snapshots: Record<string, OpponentSnapshot> = {
      [localId]: localSnap,
      ...opponents,
    };
    const ids = Object.keys(snapshots);
    const winner = decideWinner(ids, snapshots);
    const everyoneFinished =
      ids.length >= PLAYER_COUNT &&
      ids.every((id) => (snapshots[id] ?? START_SNAPSHOT).isFinished);
    if (winner !== null) {
      setWinnerId(winner);
      setPhase("over");
    } else if (everyoneFinished) {
      setWinnerId(null);
      setPhase("over");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.status, board.submitted.length, opponents, phase]);

  // On match end: stop the relay (one last publish of our finished snapshot so
  // the opponent sees the result), and record a versus win if we won.
  useEffect(() => {
    if (phase !== "over") return;
    const token = tokenOf();
    const entity = entityOf();
    // Final publish so the opponent's client can resolve identically.
    if (token && entity && lobbyIdRef.current) {
      const json = encodeSnapshot(buildSnapshot(boardRef.current, finishedAtRef.current));
      publishSnapshot(token, entity, lobbyIdRef.current, json).catch(() => {});
    }
    if (relayRef.current) {
      clearInterval(relayRef.current);
      relayRef.current = null;
    }
    if (
      winnerId &&
      winnerId === localIdRef.current &&
      !recordedWinRef.current
    ) {
      recordedWinRef.current = true;
      const total = incrementVersusWins();
      if (session) recordVersusWin(session, total).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, winnerId]);

  // Teardown on unmount.
  useEffect(() => {
    return () => {
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Entry actions ----------------------------------------------------- */

  const quickMatch = useCallback(async () => {
    const token = tokenOf();
    const entity = entityOf();
    if (!token || !entity) return;
    cancelledRef.current = false;
    setError(null);
    setPhase("searching");
    setStatusText("Finding an opponent…");
    try {
      await cancelAllTickets(token, entity);
      const ticketId = await createTicket(token, entity, MATCH_TIMEOUT_SECONDS);

      // Subscribe to the ticket's status changes so PlayFab pushes us the
      // "Matched" event, instead of polling GetMatchmakingTicket on a 1s timer.
      // We check the ticket on each push (the push is just a signal) plus a slow
      // fallback in case a push is missed or the socket never came up.
      let pollNow = true; // do one initial check right away
      const mm = new PlayFabPubSub();
      searchPubsubRef.current = mm;
      let subscribed = false;
      try {
        await mm.connect(
          token,
          entity,
          { kind: "matchTicket", queue: WORDLE_QUEUE, ticketId },
          () => {
            pollNow = true;
          }
        );
        subscribed = true;
      } catch {
        /* subscription failed — fall back to steady polling below */
      }

      const start = Date.now();
      let lastPoll = 0;
      // When subscribed, the push tells us the moment the ticket is matched, so
      // we only poll as a rare safety net (in case a push is missed or the
      // socket died); otherwise poll steadily.
      const fallbackMs = subscribed ? 25000 : 1500;
      while (Date.now() - start < MATCH_TIMEOUT_SECONDS * 1000) {
        if (cancelledRef.current) {
          await mm.disconnect();
          searchPubsubRef.current = null;
          return;
        }
        await new Promise((r) => setTimeout(r, 400));
        const now = Date.now();
        if (!pollNow && now - lastPoll < fallbackMs) continue;
        pollNow = false;
        lastPoll = now;
        let status;
        try {
          status = await pollTicket(token, ticketId);
        } catch {
          continue; // transient — try again on the next signal/fallback
        }
        if (status.status === "Matched" && status.matchId) {
          await mm.disconnect();
          searchPubsubRef.current = null;
          setStatusText("Opponent found!");
          const arrangement = await getArrangementString(token, status.matchId);
          const lobbyId = await joinArrangedLobby(
            token,
            entity,
            arrangement,
            PLAYER_COUNT
          );
          await beginMatch(lobbyId, status.matchId);
          return;
        }
      }
      await mm.disconnect();
      searchPubsubRef.current = null;
      await cancelAllTickets(token, entity);
      if (!cancelledRef.current) {
        setPhase("idle");
        setError("No opponent found. Try again, or create a private game.");
      }
    } catch (e) {
      const mm = searchPubsubRef.current;
      searchPubsubRef.current = null;
      if (mm) await mm.disconnect();
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Matchmaking failed.");
    }
  }, [beginMatch, session]);

  const createPrivate = useCallback(async () => {
    const token = tokenOf();
    const entity = entityOf();
    if (!token || !entity) return;
    cancelledRef.current = false;
    setError(null);
    setPhase("connecting");
    setStatusText("Creating game…");
    try {
      const { lobbyId, connectionString } = await createLobby(
        token,
        entity,
        PLAYER_COUNT
      );
      lobbyIdRef.current = lobbyId;
      setRoomCode(connectionString);
      setMemberCount(1);
      setPhase("waiting");
      setStatusText("Waiting for a friend to join…");
      // Poll membership until the friend arrives, then derive the word from the
      // lobbyId (both clients derive the same word) and start.
      const poll = setInterval(async () => {
        if (cancelledRef.current) {
          clearInterval(poll);
          return;
        }
        try {
          const ids = await getLobbyMemberIds(token, lobbyId);
          setMemberCount(ids.length);
          if (ids.length >= PLAYER_COUNT) {
            clearInterval(poll);
            await beginMatch(lobbyId, lobbyId);
          }
        } catch {
          /* retry */
        }
      }, 1500);
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Couldn't create the game.");
    }
  }, [beginMatch, session]);

  const joinPrivate = useCallback(
    async (code: string) => {
      const token = tokenOf();
      const entity = entityOf();
      if (!token || !entity) return;
      const trimmed = code.trim();
      if (!trimmed) {
        setError("Enter a game code to join.");
        return;
      }
      cancelledRef.current = false;
      setError(null);
      setPhase("connecting");
      setStatusText("Joining game…");
      try {
        const lobbyId = await joinLobby(token, entity, trimmed);
        await beginMatch(lobbyId, lobbyId);
      } catch (e) {
        setPhase("idle");
        setError(
          e instanceof Error ? e.message : "Couldn't join — check the code."
        );
      }
    },
    [beginMatch, session]
  );

  const leave = useCallback(() => {
    teardown();
    setPhase("idle");
    setError(null);
    setRoomCode(null);
    setMemberCount(1);
    setOpponents({});
    setWinnerId(undefined);
    setThrottled(false);
    dispatch({ type: "RESET", answer: "STARE" });
    cancelledRef.current = false;
  }, [teardown]);

  const typeLetter = useCallback(
    (letter: string) => dispatch({ type: "TYPE", letter }),
    []
  );
  const backspace = useCallback(() => dispatch({ type: "BACKSPACE" }), []);
  const submit = useCallback(() => dispatch({ type: "SUBMIT" }), []);

  const isOver = phase === "over";
  const didWin = isOver && winnerId === localIdRef.current;
  const isDraw = isOver && winnerId === null;

  return {
    phase,
    error,
    statusText,
    board,
    opponents: Object.entries(opponents).map(([id, snapshot]) => ({
      id,
      snapshot,
    })),
    isOver,
    didWin,
    isDraw,
    answer: phase === "playing" || isOver ? board.answer : null,
    roomCode,
    memberCount,
    signedIn: !!session,
    throttled,
    connectionState: connState,
    quickMatch,
    createPrivate,
    joinPrivate,
    typeLetter,
    backspace,
    submit,
    leave,
  };
}
