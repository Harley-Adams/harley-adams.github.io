import React, { useState } from "react";
import "./WordGuessPage.css"; // You can define your styles here

interface Guess {
  guess: string;
  feedback: (string | null)[];
}

function WordGuessGame(): JSX.Element {
  const [word, setWord] = useState<string>("LEMON"); // The word to guess
  const [guess, setGuess] = useState<string>(""); // The current guess
  const [feedback, setFeedback] = useState<(string | null)[]>(
    Array(word.length).fill(null)
  ); // Feedback for correct and incorrect guesses
  const [guessHistory, setGuessHistory] = useState<Guess[]>([]); // History of guesses

  // Function to handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setGuess(e.target.value.toUpperCase()); // Convert the guess to uppercase
  };

  // Function to handle guess submission
  const handleGuessSubmit = (): void => {
    if (guess.length !== word.length) {
      alert("Guess should have the same length as the word.");
      return;
    }

    let newFeedback = Array(word.length).fill(null);
    let letterCount: { [key: string]: number } = {};

    // First pass: mark correct letters and count other letters in the word
    for (let i = 0; i < word.length; i++) {
      if (word[i] === guess[i]) {
        newFeedback[i] = guess[i]; // Correct letter and position
      } else {
        if (!letterCount[word[i]]) {
          letterCount[word[i]] = 0;
        }
        letterCount[word[i]]++;
      }
    }

    // Second pass: mark misplaced letters and wrong letters
    for (let i = 0; i < word.length; i++) {
      if (!newFeedback[i]) {
        if (
          letterCount[guess[i]] &&
          letterCount[guess[i]] > 0 &&
          word.includes(guess[i])
        ) {
          newFeedback[i] = guess[i]; // Misplaced letter
          letterCount[guess[i]]--;
        } else {
          newFeedback[i] = " "; // Wrong letter, using space to indicate absence
        }
      }
    }

    setFeedback(newFeedback);
    setGuessHistory([...guessHistory, { guess, feedback: newFeedback }]);
    setGuess(""); // Clear the guess input
  };

  // Function to reset the game
  const handleResetGame = (): void => {
    setGuess("");
    setFeedback(Array(word.length).fill(null));
    setGuessHistory([]);
  };

  return (
    <div className="App">
      <h1>Word Guessing Game</h1>
      <p>Attempts: {guessHistory.length}</p>
      <div className="game-container">
        <div className="previous-guesses">
          {guessHistory.map((prevGuess, index) => (
            <div key={index} className="prev-guess">
              <div className="word-container">
                {prevGuess.guess.split("").map((letter, index) => (
                  <div
                    key={index}
                    className={`letter-box ${
                      prevGuess.feedback[index] === word[index]
                        ? "correct-letter animate-correct"
                        : word.includes(prevGuess.feedback[index] || "")
                        ? "wrong-position-letter animate-wrong-position"
                        : "wrong-letter animate-wrong"
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="guess-input">
          <input
            type="text"
            maxLength={word.length}
            value={guess}
            onChange={handleInputChange}
          />
          <button onClick={handleGuessSubmit}>Submit</button>
          {/* <button onClick={handleResetGame}>Reset</button> */}
        </div>
      </div>
    </div>
  );
}

export default WordGuessGame;
