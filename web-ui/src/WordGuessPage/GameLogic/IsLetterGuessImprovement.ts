import { LetterDictionary } from "../WordleState";
import { LetterGuessState } from "./Guess";

const IsLetterGuessImprovement = (
  keyStates: LetterDictionary,
  letter: string,
  newState: LetterGuessState
): boolean => {
  if (keyStates[letter] === LetterGuessState.Correct) {
    return false;
  }

  if (keyStates[letter] === LetterGuessState.WrongPosition) {
    if (newState === LetterGuessState.Correct) {
      return true;
    }

    return false;
  }

  if (keyStates[letter] === LetterGuessState.Wrong) {
    if (
      newState === LetterGuessState.Correct ||
      newState === LetterGuessState.WrongPosition
    ) {
      return true;
    }

    return false;
  }

  // This is the edge case where the letter has not been used before.
  return true;
};

export default IsLetterGuessImprovement;
