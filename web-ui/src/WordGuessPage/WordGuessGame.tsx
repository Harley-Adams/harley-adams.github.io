import React, { useEffect, useState } from "react";
import Keyboard from "./Keyboard";
import { Dictionary } from "./Data/Dictionary";
import { toast } from "react-toastify";
import { ReviewGuess } from "./GameLogic/ReviewGuess";
import { GuessHistory } from "./GuessHistory";
import { Guess, LetterGuessState } from "./GameLogic/Guess";
import { GuessInput } from "./GuessInput";
import { WordleGameDataContract, WordlePlayerContract } from "./WordleContract";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { UpdateWordleStatistics } from "../PlayFab/PlayFabWrapper";

interface WordGuessGameProps {
  player: PfLoginResult;
  word: string;
  gameCompleteCallback: () => void;
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
  player,
  word,
  gameCompleteCallback,
  gameUpdateCallback,
  playerUpdateCallback,
  otherPlayers,
}) => {
  word = word.toUpperCase();

  const [startTime, setStartTime] = useState<number>(0);
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const [currentGuess, setCurrentGuess] = useState<string>(""); // The current guess
  const [guessHistory, setGuessHistory] = useState<Guess[]>([]); // History of guesses
  const [isGameComplete, setIsGameComplete] = useState<boolean>(false); // Whether the game is complete

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

    setCurrentGuess(""); // Clear the guess input
    newFeedback.lettersFeedback.forEach((letterFeedback) => {
      if (letterFeedback.letter) {
        setKeyStateIfImproved(letterFeedback.letter, letterFeedback.state);
      }
    });

    // Check if the guess is correct
    if (word === currentGuess) {
      toast.success("Congratulations! You guessed the correct word.");
      let numWrongLetters = 0;
      let numMisplacedLetters = 0;

      guessHistory.forEach((guess) => {
        guess.lettersFeedback.forEach((letterFeedback) => {
          if (letterFeedback.state === LetterGuessState.Wrong) {
            numWrongLetters++;
          }
          if (letterFeedback.state === LetterGuessState.WrongPosition) {
            numMisplacedLetters++;
          }
        });
      });
      const timeTaken = Date.now() - startTime;
      console.log(`Time taken: ${timeTaken}ms ${Date.now()}  ${startTime}`);

      UpdateWordleStatistics(
        player.EntityToken,
        word,
        guessHistory.length + 1,
        timeTaken,
        numWrongLetters,
        numMisplacedLetters
      );

      setIsGameComplete(true);
    }
    if (playerUpdateCallback) {
      // remove the letters from the feedback.
      let letterlessHistory: Guess[] = [...guessHistory, newFeedback].map(
        (guess) => {
          return {
            lettersFeedback: guess.lettersFeedback.map((letterFeedback) => {
              return { state: letterFeedback.state, letter: "" };
            }),
          };
        }
      );

      const playerUpdate: WordlePlayerContract = {
        name: "PlayerName",
        feedbackHistory: letterlessHistory,
      };

      playerUpdateCallback(playerUpdate);
    }

    setGuessHistory([...guessHistory, newFeedback]);
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
        {!isGameComplete ? (
          <Keyboard keyStates={keyStates} setKeyState={setKeyState} />
        ) : null}
        {!isGameComplete ? (
          <GuessInput
            currentGuess={currentGuess}
            wordLength={word.length}
            handleInputChange={handleInputChange}
            handleKeyDown={handleKeyDown}
            handleGuessSubmit={handleGuessSubmit}
          />
        ) : (
          <FinishedUI word={word} gameCompleteCallback={gameCompleteCallback} />
        )}
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

interface FinishedGameUIProps {
  word: string;
  gameCompleteCallback: () => void;
}
const FinishedUI: React.FC<FinishedGameUIProps> = ({
  word,
  gameCompleteCallback,
}) => {
  return (
    <div>
      <h2>Game Over</h2>
      <p>The word was: {word}</p>
      <button onClick={gameCompleteCallback}>Back to home screen</button>
    </div>
  );
};
