/*
 * Realtime contract for versus Wordle. Shared game data lives in the lobby
 * (host-authored); each player's live progress rides in their member data.
 * Opponent progress is sent as per-cell color states only (0=empty, 1=absent,
 * 2=present, 3=correct) so letters are never leaked.
 */
import { LetterCell, LetterState } from "../engine";

export enum GameState {
  PreGame = "1",
  InGame = "2",
  PostGame = "3",
}

/** Lobby data is a PlayFab string map. */
export interface LobbyData {
  [key: string]: string;
  gameState: string;
  word: string;
  startTime: string;
}

/** Per-player progress broadcast to the lobby. */
export interface VersusPlayer {
  name: string;
  states: number[]; // flattened submitted-row cell states
  guessCount: number;
  solved: boolean;
  solveMs: number; // ms from startTime to solve (0 if unsolved)
}

const STATE_CODE: Record<LetterState, number> = {
  empty: 0,
  tbd: 0,
  absent: 1,
  present: 2,
  correct: 3,
};

export const CODE_STATE: Record<number, LetterState> = {
  0: "empty",
  1: "absent",
  2: "present",
  3: "correct",
};

/** Flatten the submitted rows of a board into color codes for opponents. */
export function encodeBoard(guesses: LetterCell[][], rows: number): number[] {
  const out: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (const cell of guesses[r]) out.push(STATE_CODE[cell.state]);
  }
  return out;
}
