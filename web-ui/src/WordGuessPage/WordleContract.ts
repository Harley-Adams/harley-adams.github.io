import { LetterGuessState } from "./Guess";

export interface WordleGameDataContract {
  gameState: GameState;
  word: string;
  startTime: number;
}

export interface WorldlePlayerContract {
  name: string;
  feedback: LetterGuessState[];
}

export enum GameState {
  preGame = "pregame",
  inGame = "ingame",
  postGame = "postgame",
}
