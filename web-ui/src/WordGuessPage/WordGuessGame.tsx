import React, { useEffect, useState } from "react";
import Keyboard from "./GameViews/Keyboard";
import { toast } from "react-toastify";
import { ReviewGuess } from "./GameLogic/ReviewGuess";
import { GuessHistory } from "./GameViews/GuessHistory";
import { GuessInput } from "./GameViews/GuessInput";
import {
  GuessFeedback,
  LetterGuessState,
  WordleGameDataContract,
  WordlePlayerContract,
} from "./WordleContract";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import {
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import {
  answerWordState,
  customIdState,
  loggedInPlayerState,
  playerGuessHistory,
  playerLetterGuessState,
} from "./WordleState";
import OtherPlayersView from "./GameViews/OtherPlayersView";
import GameOverView from "./GameViews/GameOverView";
import IsLetterGuessImprovement from "./GameLogic/IsLetterGuessImprovement";
import { IsValidGuess } from "./GameLogic/IsValidGuess";
import { UpdateWordleStatistics } from "./GameLogic/UpdateWordleStatistics";
import {
  PuzzleTimeGameModes,
  currentGameMode,
} from "../PuzzleTime/PuzzleTimePage";
import { GuessRow } from "./GameViews/GuessRow";

interface WordGuessGameProps {
  wordProp: string;
  gameCompleteCallback: () => void;
  gameUpdateCallback?: (update: WordleGameDataContract) => void;
  playerUpdateCallback?: (update: WordlePlayerContract) => void;
}

const WordGuessGame: React.FC<WordGuessGameProps> = ({
  wordProp,
  gameCompleteCallback,
  gameUpdateCallback,
  playerUpdateCallback,
}) => {
  const [startTime, setStartTime] = useState<number>(0);
  const resetPlayerGuessHistory = useResetRecoilState(playerGuessHistory);
  const resetLetterGuessState = useResetRecoilState(playerLetterGuessState);
  const setGameMode = useSetRecoilState(currentGameMode);
  const [player] = useRecoilState(loggedInPlayerState);

  useEffect(() => {
    resetPlayerGuessHistory();
    resetLetterGuessState();
    setStartTime(Date.now());
  }, []);

  const [word, setWord] = useRecoilState(answerWordState);
  setWord(wordProp);
  const [keyStates, setKeyStates] = useRecoilState(playerLetterGuessState);

  const [currentGuess, setCurrentGuess] = useState<string>(""); // The current guess
  const [guessHistory, setGuessHistory] =
    useRecoilState<GuessFeedback[]>(playerGuessHistory); // History of guesses

  const [isGameComplete, setIsGameComplete] = useState<boolean>(false); // Whether the game is complete
  const customId = useRecoilValue(customIdState);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrentGuess(e.target.value.toUpperCase()); // Convert the guess to uppercase
  };

  const handleLetterHit = (letter: string) => {
    if (currentGuess.length < word.length) {
      setCurrentGuess(currentGuess + letter);
    }
  };

  const handleBackspace = () => {
    if (currentGuess.length > 0) {
      setCurrentGuess(currentGuess.slice(0, -1));
    }
  };

  // Function to handle guess submission
  const handleGuessSubmit = (): void => {
    if (!IsValidGuess(currentGuess, word.length)) {
      // setCurrentGuess(""); // Clear the guess input
      return;
    }

    const newFeedback: GuessFeedback = ReviewGuess(word, currentGuess);

    setCurrentGuess(""); // Clear the guess input
    const keyStateUpdates = new Map<string, LetterGuessState>();

    newFeedback.lettersFeedback.forEach((letterFeedback) => {
      if (
        letterFeedback.letter &&
        IsLetterGuessImprovement(
          keyStates,
          letterFeedback.letter,
          letterFeedback.state
        )
      ) {
        keyStateUpdates.set(letterFeedback.letter, letterFeedback.state);
      }
    });

    if (keyStateUpdates.size > 0) {
      setKeyStates((prevStates) => ({
        ...prevStates,
        ...Object.fromEntries(keyStateUpdates),
      }));
    }

    // Check if the guess is correct
    if (word === currentGuess) {
      toast.success("Congratulations! You guessed the correct word.");
      const timeTaken = Date.now() - startTime;
      if (player) {
        UpdateWordleStatistics(player, timeTaken, word, guessHistory);
      }
      setIsGameComplete(true);
    }

    if (playerUpdateCallback) {
      // remove the letters from the feedback.
      let letterlessHistory: GuessFeedback[] = [
        ...guessHistory,
        newFeedback,
      ].map((guess) => {
        return {
          lettersFeedback: guess.lettersFeedback.map((letterFeedback) => {
            return { state: letterFeedback.state };
          }),
        };
      });

      const playerUpdate: WordlePlayerContract = {
        name: customId,
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
  let inputDiv: React.ReactNode = (
    <div className="userInputArea">
      <Keyboard onKeyHit={handleLetterHit} />

      <GuessInput
        currentGuess={currentGuess}
        wordLength={word.length}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        handleGuessSubmit={handleGuessSubmit}
        handleBackspace={handleBackspace}
      />
    </div>
  );

  const currentGuessAsFeedback: GuessFeedback = {
    lettersFeedback: [
      ...currentGuess
        .padEnd(5, " ")
        .split("")
        .map((letter) => {
          return { letter, state: LetterGuessState.Unused };
        }),
    ],
  };

  return (
    <div className="App">
      <h1>Word Guessing Game</h1>
      <p>Attempts: {guessHistory.length}</p>
      <div className="game-container">
        <GuessHistory guessHistory={guessHistory} />
        {!isGameComplete ? (
          <GuessRow guessFeedback={currentGuessAsFeedback} index={1} />
        ) : null}
        {!isGameComplete ? (
          inputDiv
        ) : (
          <GameOverView
            onClickGameCompleteCallback={() => {
              gameCompleteCallback();
              setGameMode(PuzzleTimeGameModes.MainMenu);
            }}
          />
        )}
      </div>

      <OtherPlayersView />
    </div>
  );
};

export default WordGuessGame;
