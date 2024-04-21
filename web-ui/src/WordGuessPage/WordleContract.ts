import { Guess } from "./Guess";

export interface WordleGameDataContract {
  gameState: GameState;
  word: string;
  startTime: number;
}

export interface WordlePlayerContract {
  name: string;
  feedbackHistory: Guess[];
}

export enum GameState {
  preGame = "1",
  inGame = "2",
  postGame = "3",
}
