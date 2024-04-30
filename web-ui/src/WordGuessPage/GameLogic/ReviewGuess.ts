import {
  GuessFeedback,
  LetterFeedback,
  LetterGuessState,
} from "../WordleContract";

export const ReviewGuess = (word: string, guess: string): GuessFeedback => {
  let feedbackPerLetter: LetterFeedback[] = guess
    .split("")
    .map((character) => ({
      letter: character,
      state: LetterGuessState.Unused,
    }));

  let lettersInWordButNotGuessCount: { [key: string]: number } = {};

  // First pass: correct positions and count of letters in word.
  for (let i = 0; i < word.length; i++) {
    if (word[i] === guess[i]) {
      feedbackPerLetter[i].state = LetterGuessState.Correct;
    } else {
      lettersInWordButNotGuessCount[word[i]] =
        (lettersInWordButNotGuessCount[word[i]] || 0) + 1;
    }
  }

  // Second pass: wrong positions and wrong letters
  for (let i = 0; i < word.length; i++) {
    if (feedbackPerLetter[i].state !== LetterGuessState.Correct) {
      if (lettersInWordButNotGuessCount[guess[i]] > 0) {
        feedbackPerLetter[i].state = LetterGuessState.WrongPosition; // Misplaced letter
        lettersInWordButNotGuessCount[guess[i]]--;
      } else {
        feedbackPerLetter[i].state = LetterGuessState.Wrong; // Wrong letter
      }
    }
  }

  return { lettersFeedback: feedbackPerLetter };
};
