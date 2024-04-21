import React, { useState } from "react";
import { LetterGuessState } from "./Guess";

// Define the layout of the QWERTY keyboard
const KEYS: string[][] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

interface KeyProps {
  letter: string;
  keyState: LetterGuessState;
}

const Key: React.FC<KeyProps> = ({ letter, keyState }) => {
  return (
    <button
      className={`key ${getKeyCssClass(keyState)}`}
      //   onClick={() => setKeyState(letter, nextKeyState(keyState))}
    >
      {letter}
    </button>
  );
};

const getKeyCssClass = (keyState: LetterGuessState): string => {
  switch (keyState) {
    case LetterGuessState.Correct:
      return "correct-letter";
    case LetterGuessState.WrongPosition:
      return "wrong-position-letter";
    case LetterGuessState.Wrong:
      return "wrong-letter";
    case LetterGuessState.Unused:
      return "unused-letter";
    default:
      return "unused-letter";
  }
};

interface KeyboardProps {
  keyStates: { [key: string]: LetterGuessState };
  setKeyState: (letter: string, newState: LetterGuessState) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ keyStates, setKeyState }) => {
  return (
    <div className="keyboard-container">
      {KEYS.map((row, index) => (
        <div key={index} className="keyboard-row">
          {row.map((letter) => (
            <Key key={letter} letter={letter} keyState={keyStates[letter]} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
