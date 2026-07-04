/*
 * useWordle — the game's state manager, ported from the iOS GameViewModel.swift.
 * Owns the board, keyboard states, win/lose flow, hints, invalid-guess shake,
 * transient messages, stats recording, and resumable persistence.
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
  winMessage,
} from "./engine";
import { answerForSeed, isValidGuess, randomAnswer } from "./words";
import { dailyNumber, dailySeed } from "../lib/seed";
import {
  SavedGame,
  WordleStats,
  clearRandomGame,
  loadDailyGame,
  loadRandomGame,
  loadStats,
  recordResult,
  saveDailyGame,
  saveRandomGame,
} from "../lib/storage";

export type WordleMode = "random" | "daily";

interface State {
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

type Action =
  | { type: "TYPE"; letter: string }
  | { type: "BACKSPACE" }
  | { type: "SUBMIT" }
  | { type: "CLEAR_SHAKE" }
  | { type: "RESET"; answer: string };

function freshBoard(answer: string): State {
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

/** Apply one already-validated guess word to the board (used live and on replay). */
function applyGuess(state: State, word: string): State {
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
    return {
      ...state,
      guesses,
      keyStates,
      submitted,
      status: "won",
      message: winMessage(state.currentRow),
    };
  }
  if (state.currentRow === MAX_GUESSES - 1) {
    return {
      ...state,
      guesses,
      keyStates,
      submitted,
      status: "lost",
      message: state.answer,
    };
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

function reducer(state: State, action: Action): State {
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

/** Rebuild a board from a saved game by replaying its submitted guesses. */
function replay(answer: string, words: string[]): State {
  let s = freshBoard(answer);
  for (const w of words) {
    if (s.status !== "playing") break;
    s = applyGuess(s, w);
  }
  return s;
}

function initState(mode: WordleMode): State {
  if (mode === "daily") {
    const answer = answerForSeed(dailySeed());
    const saved = loadDailyGame();
    if (saved && saved.answer.toUpperCase() === answer.toUpperCase()) {
      return replay(answer, saved.guesses);
    }
    return freshBoard(answer);
  }
  const saved = loadRandomGame();
  if (saved && saved.status === "playing" && saved.answer) {
    return replay(saved.answer, saved.guesses);
  }
  return freshBoard(randomAnswer());
}

export interface WordleController {
  state: State;
  mode: WordleMode;
  stats: WordleStats;
  toast: string | null;
  dailyNo: number;
  typeLetter: (letter: string) => void;
  backspace: () => void;
  submit: () => void;
  hint: () => void;
  newGame: () => void;
  dismissToast: () => void;
  shareText: () => string;
}

export function useWordle(mode: WordleMode): WordleController {
  const [state, dispatch] = useReducer(reducer, mode, initState);
  const statsRef = useRef<WordleStats>(loadStats());
  const recordedRef = useRef(false);
  const [toast, setToast] = useState<string | null>(null);
  const [, forceRender] = useReducer((n: number) => n + 1, 0);

  // Auto-clear the invalid-guess shake shortly after it fires.
  useEffect(() => {
    if (state.shakeRow === null) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_SHAKE" }), 600);
    return () => clearTimeout(t);
  }, [state.shakeRow]);

  // Persist the board so a refresh resumes it.
  useEffect(() => {
    const game: SavedGame = {
      answer: state.answer,
      guesses: state.submitted,
      status: state.status,
      recorded: recordedRef.current,
    };
    if (mode === "daily") saveDailyGame(game);
    else if (state.status === "playing") saveRandomGame(game);
    else clearRandomGame();
  }, [mode, state.answer, state.submitted, state.status]);

  // Record the result into lifetime stats exactly once per finished game.
  useEffect(() => {
    if (state.status === "playing" || recordedRef.current) return;
    // For a resumed daily that was already finished + recorded, skip.
    const saved = mode === "daily" ? loadDailyGame() : null;
    if (saved?.recorded) {
      recordedRef.current = true;
      statsRef.current = loadStats();
      forceRender();
      return;
    }
    recordedRef.current = true;
    statsRef.current = recordResult({
      won: state.status === "won",
      guessCount: state.currentRow + 1,
      isDaily: mode === "daily",
    });
    if (mode === "daily") {
      saveDailyGame({
        answer: state.answer,
        guesses: state.submitted,
        status: state.status,
        recorded: true,
      });
    }
    forceRender();
  }, [state.status, state.currentRow, state.answer, state.submitted, mode]);

  const typeLetter = useCallback(
    (letter: string) => dispatch({ type: "TYPE", letter }),
    []
  );
  const backspace = useCallback(() => dispatch({ type: "BACKSPACE" }), []);
  const submit = useCallback(() => dispatch({ type: "SUBMIT" }), []);

  const hint = useCallback(() => {
    if (state.status !== "playing") {
      setToast(`The word was ${state.answer}.`);
      return;
    }
    const answerChars = state.answer.split("");
    const greenCols = new Set<number>();
    for (const row of state.guesses) {
      row.forEach((cell, i) => {
        if (cell.state === "correct") greenCols.add(i);
      });
    }
    const unknown = [...Array(WORD_LENGTH).keys()].filter(
      (i) => !greenCols.has(i)
    );
    if (unknown.length === 0) {
      setToast("You've found every letter!");
      return;
    }
    const col = unknown[Math.floor(Math.random() * unknown.length)];
    setToast(`Letter ${col + 1} is “${answerChars[col]}”.`);
  }, [state.status, state.answer, state.guesses]);

  const newGame = useCallback(() => {
    recordedRef.current = false;
    if (mode === "daily") {
      // Daily is one board per day; "new game" retries the same word.
      dispatch({ type: "RESET", answer: answerForSeed(dailySeed()) });
    } else {
      clearRandomGame();
      dispatch({ type: "RESET", answer: randomAnswer() });
    }
  }, [mode]);

  const dismissToast = useCallback(() => setToast(null), []);

  const shareText = useCallback(() => {
    const glyph: Record<LetterState, string> = {
      correct: "🟩",
      present: "🟨",
      absent: "⬛",
      empty: "⬛",
      tbd: "⬛",
    };
    const solvedRow =
      state.status === "won" ? String(state.currentRow + 1) : "X";
    const header =
      mode === "daily"
        ? `PuzzleTime Wordle #${dailyNumber()} ${solvedRow}/${MAX_GUESSES}`
        : `PuzzleTime Wordle ${solvedRow}/${MAX_GUESSES}`;
    const grid = state.submitted
      .map((word) =>
        scoreGuess(word, state.answer)
          .map((s) => glyph[s])
          .join("")
      )
      .join("\n");
    return `${header}\n\n${grid}`;
  }, [state.status, state.currentRow, state.submitted, state.answer, mode]);

  return {
    state,
    mode,
    stats: statsRef.current,
    toast,
    dailyNo: dailyNumber(),
    typeLetter,
    backspace,
    submit,
    hint,
    newGame,
    dismissToast,
    shareText,
  };
}
