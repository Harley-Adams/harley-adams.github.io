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

export function encodeGuess(values: LetterGuessState[]): number {
  let encoded = 0;
  values.forEach((value, index) => {
    encoded |= value << (2 * index);
  });
  return encoded;
}

export function decodeValues(
  encoded: number,
  length: number
): LetterGuessState[] {
  const values = [];
  for (let i = 0; i < length; i++) {
    values.push((encoded >> (2 * i)) & 0b11);
  }
  return values;
}
