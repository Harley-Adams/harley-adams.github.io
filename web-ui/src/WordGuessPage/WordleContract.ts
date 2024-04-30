export interface WordleGameDataContract {
  gameState: GameState;
  word: string;
  startTime: number;
}

export interface WordlePlayerContract {
  name: string;
  feedbackHistory?: GuessFeedback[];
  encodedGuesses?: string;
}

export enum GameState {
  preGame = "1",
  inGame = "2",
  postGame = "3",
}

export interface GuessFeedback {
  lettersFeedback: LetterFeedback[];
}

export interface LetterFeedback {
  letter?: string;
  state: LetterGuessState;
}

export enum LetterGuessState {
  Unused = 0,
  Correct = 1,
  WrongPosition = 2,
  Wrong = 3,
}
