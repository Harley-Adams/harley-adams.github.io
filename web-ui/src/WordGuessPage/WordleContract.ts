import { LetterGuessState } from "./Guess";

export interface WordleGameDataContract {
  word: string;
  startTime: number;
}

export interface WorldlePlayerContract {
  name: string;
  feedback: LetterGuessState[];
}
