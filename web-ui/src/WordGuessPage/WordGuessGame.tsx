import React, { useState } from "react";
import Keyboard from "./Keyboard";
import { Dictionary } from "./Dictionary";
import { toast } from "react-toastify";
import { ReviewGuess } from "./ReviewGuess";
import { GuessHistory } from "./GuessHistory";
import { Guess, LetterGuessState } from "./Guess";
import { GuessInput } from "./GuessInput";
import PlayFabPubSub from "../PlayFab/PlayFabPubSub";
import { WordleGameDataContract } from "./WordleContract";

interface WordGuessGameProps {
  word: string;
  pubSub?: PlayFabPubSub<WordleGameDataContract>;
}

// Define the layout of the QWERTY keyboard
const KEYS: string[][] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const WordGuessGame: React.FC<WordGuessGameProps> = ({ word }) => {
  word = word.toUpperCase();

  const [currentGuess, setCurrentGuess] = useState<string>(""); // The current guess
  const [guessHistory, setGuessHistory] = useState<Guess[]>([]); // History of guesses

  // Function to handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrentGuess(e.target.value.toUpperCase()); // Convert the guess to uppercase
  };

  // Function to handle guess submission
  const handleGuessSubmit = (): void => {
    if (currentGuess.length !== word.length) {
      toast.error("Guess should have the same length as the word.", {
        position: "top-center",
      });

      return;
    }

    if (Dictionary.includes(currentGuess.toLowerCase()) === false) {
      toast.error("Guess is not a valid word.");
      setCurrentGuess("");

      return;
    }

    const newFeedback = ReviewGuess(word, currentGuess);

    setGuessHistory([...guessHistory, newFeedback]);
    setCurrentGuess(""); // Clear the guess input
    newFeedback.lettersFeedback.forEach((letterFeedback) => {
      setKeyStateIfImproved(letterFeedback.letter, letterFeedback.state);
    });
    // Check if the guess is correct
    if (word === currentGuess) {
      toast.success("Congratulations! You guessed the correct word.");
    }
  };

  // Function to handle key press in the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleGuessSubmit();
    }
  };

  const initialKeyStates: { [key: string]: string } = KEYS.flat().reduce(
    (acc, key) => ({ ...acc, [key]: "unused-letter" }),
    {}
  );

  const [keyStates, setKeyStates] = useState<{ [key: string]: string }>(
    initialKeyStates
  );

  const setKeyState = (letter: string, newState: string) => {
    setKeyStates((prevStates) => ({
      ...prevStates,
      [letter]: newState,
    }));
  };

  const setKeyStateIfImproved = (letter: string, newState: string) => {
    if (keyStates[letter] === LetterGuessState.Correct) {
      return;
    }

    if (
      keyStates[letter] === LetterGuessState.WrongPosition &&
      newState === LetterGuessState.Correct
    ) {
      setKeyState(letter, newState);
      return;
    }

    if (
      keyStates[letter] === LetterGuessState.Wrong &&
      (newState === LetterGuessState.Correct ||
        newState === LetterGuessState.WrongPosition)
    ) {
      setKeyState(letter, newState);
      return;
    }

    setKeyState(letter, newState);
  };

  let letterlessHistory = guessHistory.map((guess) => {
    return {
      lettersFeedback: guess.lettersFeedback.map((letter) => {
        let cleanedLetter = { state: letter.state, letter: "" };
        return cleanedLetter;
      }),
    };
  });

  return (
    <div className="App">
      <h1>Word Guessing Game</h1>
      <p>Attempts: {guessHistory.length}</p>
      <div className="game-container">
        <GuessHistory guessHistory={guessHistory} />
        <Keyboard keyStates={keyStates} setKeyState={setKeyState} />
        <GuessInput
          currentGuess={currentGuess}
          wordLength={word.length}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          handleGuessSubmit={handleGuessSubmit}
        />
      </div>
    </div>
  );
};

export default WordGuessGame;
