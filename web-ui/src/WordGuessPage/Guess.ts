export interface Guess {
  lettersFeedback: LetterFeedback[];
}

export interface LetterFeedback {
  letter: string;
  state: LetterGuessState;
}

export enum LetterGuessState {
  Unused = "unused-letter",
  Correct = "correct-letter",
  WrongPosition = "wrong-position-letter",
  Wrong = "wrong-letter",
}
