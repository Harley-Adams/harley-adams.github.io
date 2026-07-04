/*
 * useVersus — drives a realtime head-to-head Wordle match: lobby browsing,
 * create/join, the host-authored game start, the local board, and broadcasting
 * this player's progress while merging opponents' progress from the lobby feed.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
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
import { isValidGuess, randomAnswer } from "../words";
import { PlayFabPubSub, PubSubMessage } from "../../net/pubsub";
import { createLobby, findLobbies, joinLobby, leaveLobby } from "../../net/lobby";
import { PlayFabSession, LobbySummary } from "../../net/types";
import { recordVersusWin } from "../../net/stats";
import { incrementVersusWins } from "../../lib/storage";
import {
  GameState,
  LobbyData,
  VersusPlayer,
  encodeBoard,
} from "./contract";

export type VersusPhase =
  | "browsing"
  | "lobby"
  | "playing"
  | "results";

interface BoardState {
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

function freshBoard(answer: string): BoardState & { answer: string } {
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

function boardReducer(
  state: BoardState & { answer: string },
  action: BoardAction
): BoardState & { answer: string } {
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
      guesses[state.currentRow][state.currentColumn] = { letter: upper, state: "tbd" };
      return { ...state, guesses, currentColumn: state.currentColumn + 1, message: null };
    }
    case "BACKSPACE": {
      if (state.status !== "playing" || state.currentColumn === 0) return state;
      const guesses = state.guesses.map((row) => row.slice());
      guesses[state.currentRow][state.currentColumn - 1] = { letter: null, state: "empty" };
      return { ...state, guesses, currentColumn: state.currentColumn - 1, message: null };
    }
    case "SUBMIT": {
      if (state.status !== "playing") return state;
      if (state.currentColumn < WORD_LENGTH) {
        return { ...state, message: "Not enough letters", shakeRow: state.currentRow };
      }
      const word = state.guesses[state.currentRow].map((c) => c.letter ?? "").join("");
      if (!isValidGuess(word)) {
        return { ...state, message: "Not in word list", shakeRow: state.currentRow };
      }
      const states = scoreGuess(word, state.answer);
      const guesses = state.guesses.map((row) => row.slice());
      const keyStates = { ...state.keyStates };
      word.split("").forEach((ch, i) => {
        guesses[state.currentRow][i] = { letter: ch, state: states[i] };
        keyStates[ch] = mergeKeyState(keyStates[ch], states[i]);
      });
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
    case "CLEAR_SHAKE":
      return { ...state, shakeRow: null };
    case "RESET":
      return freshBoard(action.answer);
    default:
      return state;
  }
}

export interface Opponent extends VersusPlayer {
  entityId: string;
}

export interface VersusController {
  phase: VersusPhase;
  status: string | null;
  error: string | null;
  lobbies: LobbySummary[];
  isHost: boolean;
  board: BoardState;
  opponents: Opponent[];
  roster: Opponent[];
  winnerName: string | null;
  iWon: boolean;
  startMs: number | null;
  refreshLobbies: () => Promise<void>;
  create: () => Promise<void>;
  join: (connectionString: string) => Promise<void>;
  start: () => Promise<void>;
  typeLetter: (letter: string) => void;
  backspace: () => void;
  submit: () => void;
  leave: () => void;
}

export function useVersus(session: PlayFabSession): VersusController {
  const [board, dispatch] = useReducer(boardReducer, "", freshBoard);
  const [phase, setPhase] = useState<VersusPhase>("browsing");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lobbies, setLobbies] = useState<LobbySummary[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [members, setMembers] = useState<Record<string, Opponent>>({});
  const [startMs, setStartMs] = useState<number | null>(null);

  const pubsubRef = useRef<PlayFabPubSub<LobbyData, VersusPlayer> | null>(null);
  const lobbyIdRef = useRef<string>("");
  const startMsRef = useRef<number | null>(null);
  const recordedWinRef = useRef(false);
  const myId = session.entityToken.Entity.Id;

  // Clear the invalid-guess shake shortly after it fires.
  useEffect(() => {
    if (board.shakeRow === null) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_SHAKE" }), 600);
    return () => clearTimeout(t);
  }, [board.shakeRow]);

  const broadcastMe = useCallback(
    (rowsSubmitted: number, boardState: BoardState & { answer: string }) => {
      const pubsub = pubsubRef.current;
      if (!pubsub || !lobbyIdRef.current) return;
      const solved = boardState.status === "won";
      const solveMs =
        solved && startMsRef.current ? Date.now() - startMsRef.current : 0;
      const payload: VersusPlayer = {
        name: session.displayName,
        states: encodeBoard(boardState.guesses, rowsSubmitted),
        guessCount: rowsSubmitted,
        solved,
        solveMs,
      };
      pubsub.updateLobby(session.entityToken, lobbyIdRef.current, {
        playerData: payload,
      });
    },
    [session.displayName, session.entityToken]
  );

  // Broadcast my progress whenever a guess is submitted or the game ends.
  const lastBroadcastRef = useRef(-1);
  useEffect(() => {
    if (phase !== "playing") return;
    const rows = board.submitted.length;
    if (rows === lastBroadcastRef.current && board.status === "playing") return;
    lastBroadcastRef.current = rows;
    broadcastMe(rows, board as BoardState & { answer: string });
  }, [phase, board, broadcastMe]);

  const handleMessage = useCallback(
    (msg: PubSubMessage<LobbyData, VersusPlayer>) => {
      msg.lobbyChanges?.forEach((change) => {
        if (change.lobbyData?.gameState === GameState.InGame && change.lobbyData.word) {
          const ms = Number(change.lobbyData.startTime) || Date.now();
          startMsRef.current = ms;
          setStartMs(ms);
          recordedWinRef.current = false;
          lastBroadcastRef.current = -1;
          dispatch({ type: "RESET", answer: change.lobbyData.word });
          setPhase("playing");
        }
        const merge = change.memberToMerge;
        if (merge?.memberData && typeof merge.memberData === "object") {
          const data = merge.memberData as VersusPlayer;
          const id = merge.memberEntity.Id;
          setMembers((prev) => ({ ...prev, [id]: { entityId: id, ...data } }));
        }
      });
    },
    []
  );

  const setupPubsub = useCallback(
    async (lobbyId: string) => {
      const pubsub = new PlayFabPubSub<LobbyData, VersusPlayer>();
      pubsubRef.current = pubsub;
      lobbyIdRef.current = lobbyId;
      await pubsub.connect(
        session.entityToken,
        lobbyId,
        () => {
          setPhase("lobby");
          // Announce myself so the roster converges for everyone.
          pubsub.updateLobby(session.entityToken, lobbyId, {
            playerData: {
              name: session.displayName,
              states: [],
              guessCount: 0,
              solved: false,
              solveMs: 0,
            },
          });
        },
        handleMessage
      );
    },
    [session.entityToken, session.displayName, handleMessage]
  );

  const refreshLobbies = useCallback(async () => {
    setError(null);
    setStatus("Finding matches…");
    try {
      const result = await findLobbies(session.entityToken);
      setLobbies(result.Lobbies ?? []);
      setStatus(result.Lobbies?.length ? null : "No open matches — create one!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not find matches.");
      setStatus(null);
    }
  }, [session.entityToken]);

  const create = useCallback(async () => {
    setError(null);
    setStatus("Creating match…");
    try {
      const result = await createLobby(
        session.entityToken,
        session.entityToken.Entity,
        { gameState: GameState.PreGame, word: "", startTime: "" },
        { string_key1: "wordle" }
      );
      setIsHost(true);
      setMembers({});
      await setupPubsub(result.LobbyId);
      setStatus(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create match.");
      setStatus(null);
    }
  }, [session.entityToken, setupPubsub]);

  const join = useCallback(
    async (connectionString: string) => {
      setError(null);
      setStatus("Joining match…");
      try {
        const result = await joinLobby(
          session.entityToken,
          connectionString,
          session.entityToken.Entity
        );
        setIsHost(false);
        setMembers({});
        await setupPubsub(result.LobbyId);
        setStatus(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not join match.");
        setStatus(null);
      }
    },
    [session.entityToken, setupPubsub]
  );

  const start = useCallback(async () => {
    const pubsub = pubsubRef.current;
    if (!pubsub || !lobbyIdRef.current) return;
    const word = randomAnswer();
    const startTime = Date.now();
    await pubsub.updateLobby(session.entityToken, lobbyIdRef.current, {
      lobbyData: {
        gameState: GameState.InGame,
        word,
        startTime: String(startTime),
      },
    });
  }, [session.entityToken]);

  const leave = useCallback(() => {
    const pubsub = pubsubRef.current;
    const lobbyId = lobbyIdRef.current;
    if (pubsub && lobbyId) {
      leaveLobby(session.entityToken, lobbyId, session.entityToken.Entity).catch(() => {});
      pubsub.disconnect();
    }
    pubsubRef.current = null;
    lobbyIdRef.current = "";
    startMsRef.current = null;
    recordedWinRef.current = false;
    setMembers({});
    setIsHost(false);
    setStartMs(null);
    setPhase("browsing");
  }, [session.entityToken]);

  // Disconnect on unmount.
  useEffect(() => {
    return () => {
      pubsubRef.current?.disconnect();
    };
  }, []);

  const typeLetter = useCallback((letter: string) => dispatch({ type: "TYPE", letter }), []);
  const backspace = useCallback(() => dispatch({ type: "BACKSPACE" }), []);
  const submit = useCallback(() => dispatch({ type: "SUBMIT" }), []);

  // Everyone (including me) as a roster; opponents exclude me.
  const roster = useMemo<Opponent[]>(() => {
    const list = Object.values(members);
    if (!members[myId]) {
      list.push({
        entityId: myId,
        name: session.displayName,
        states: [],
        guessCount: board.submitted.length,
        solved: board.status === "won",
        solveMs: 0,
      });
    }
    return list;
  }, [members, myId, session.displayName, board.submitted.length, board.status]);

  const opponents = useMemo(
    () => roster.filter((p) => p.entityId !== myId),
    [roster, myId]
  );

  // Winner: earliest solver across the whole roster.
  const winner = useMemo(() => {
    const solvers = roster.filter((p) => p.solved && p.solveMs > 0);
    if (solvers.length === 0) return null;
    return solvers.reduce((a, b) => (a.solveMs <= b.solveMs ? a : b));
  }, [roster]);

  const iWon = winner?.entityId === myId;

  // Move to results once a winner exists or my board is done, and record my win.
  useEffect(() => {
    if (phase !== "playing") return;
    if (winner) {
      if (iWon && !recordedWinRef.current) {
        recordedWinRef.current = true;
        const total = incrementVersusWins();
        recordVersusWin(session, total).catch(() => {});
      }
      setPhase("results");
    } else if (board.status !== "playing") {
      // I finished (lost/out of guesses) but nobody has solved yet — wait,
      // but surface my completion; results appear when a winner emerges.
      setStatus(board.status === "lost" ? "Out of guesses — waiting…" : null);
    }
  }, [phase, winner, iWon, board.status, session]);

  return {
    phase,
    status,
    error,
    lobbies,
    isHost,
    board,
    opponents,
    roster,
    winnerName: winner?.name ?? null,
    iWon,
    startMs,
    refreshLobbies,
    create,
    join,
    start,
    typeLetter,
    backspace,
    submit,
    leave,
  };
}
