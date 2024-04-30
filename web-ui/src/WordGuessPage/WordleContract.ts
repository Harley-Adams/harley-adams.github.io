import { GuessFeedback } from "./GameLogic/Guess";

export interface WordleGameDataContract {
  gameState: GameState;
  word: string;
  startTime: number;
}

export interface WordlePlayerContract {
  name: string;
  feedbackHistory: GuessFeedback[];
  // encodedGuesses: number;
}

export enum GameState {
  preGame = "1",
  inGame = "2",
  postGame = "3",
}
