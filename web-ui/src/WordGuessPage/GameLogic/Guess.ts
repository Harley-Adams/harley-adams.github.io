export interface Guess {
  lettersFeedback: LetterFeedback[];
}

export interface LetterFeedback {
  letter?: string;
  state: LetterGuessState;
}

export enum LetterGuessState {
  Unused = "1",
  Correct = "2",
  WrongPosition = "3",
  Wrong = "4",
}
