import React, { useState } from "react";
import Keyboard from "./Keyboard";
import { Dictionary } from "./Dictionary";
import { toast } from "react-toastify";
import { ReviewGuess } from "./ReviewGuess";
import { GuessHistory } from "./GuessHistory";
import { Guess, LetterFeedback, LetterGuessState } from "./Guess";
import { GuessInput } from "./GuessInput";
import { WordleGameDataContract, WordlePlayerContract } from "./WordleContract";

interface WordGuessGameProps {
  word: string;
  gameUpdateCallback?: (update: WordleGameDataContract) => void;
  playerUpdateCallback?: (update: WordlePlayerContract) => void;
  otherPlayers?: Map<string, WordlePlayerContract>;
}

// Define the layout of the QWERTY keyboard
const KEYS: string[][] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const WordGuessGame: React.FC<WordGuessGameProps> = ({
  word,
  gameUpdateCallback,
  playerUpdateCallback,
  otherPlayers,
}) => {
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
      if (letterFeedback.letter) {
        setKeyStateIfImproved(letterFeedback.letter, letterFeedback.state);
      }
    });
    // Check if the guess is correct
    if (word === currentGuess) {
      toast.success("Congratulations! You guessed the correct word.");
    }
    if (playerUpdateCallback) {
      // remove the letters from the feedback.
      let letterlessHistory: Guess[] = guessHistory.map((guess) => {
        return {
          lettersFeedback: guess.lettersFeedback.map((letterFeedback) => {
            return { state: letterFeedback.state, letter: "" };
          }),
        };
      });

      const playerUpdate: WordlePlayerContract = {
        name: "PlayerName",
        feedbackHistory: letterlessHistory,
      };

      playerUpdateCallback(playerUpdate);
    }
  };

  // Function to handle key press in the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleGuessSubmit();
    }
  };

  const initialKeyStates: { [key: string]: LetterGuessState } =
    KEYS.flat().reduce(
      (acc, key) => ({ ...acc, [key]: LetterGuessState.Unused }),
      {}
    );

  const [keyStates, setKeyStates] = useState<{
    [key: string]: LetterGuessState;
  }>(initialKeyStates);

  const setKeyState = (letter: string, newState: LetterGuessState) => {
    setKeyStates((prevStates) => ({
      ...prevStates,
      [letter]: newState,
    }));
  };

  const setKeyStateIfImproved = (
    letter: string,
    newState: LetterGuessState
  ) => {
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

      <OtherPlayers otherPlayers={otherPlayers} />
    </div>
  );
};

export default WordGuessGame;

const OtherPlayers: React.FC<{
  otherPlayers?: Map<string, WordlePlayerContract>;
}> = ({ otherPlayers }) => {
  if (!otherPlayers) {
    return null;
  }
  // Convert Map entries to an array of JSX elements
  const mapItems = Array.from(otherPlayers, ([key, value]) => (
    <div key={key} className="player-item">
      {key}: <GuessHistory guessHistory={value.feedbackHistory} />
    </div>
  ));
  return (
    <div>
      <h2>Other Players</h2>
      <div className="players-container">{mapItems}</div>
    </div>
  );
};
