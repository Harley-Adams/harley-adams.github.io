import React from "react";
import { useRecoilState } from "recoil";
import { playerLetterGuessState } from "../WordleState";
import { LetterGuessState } from "../WordleContract";

// Define the layout of the QWERTY keyboard
const KEYS: string[][] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

interface KeyProps {
  letter: string;
  keyState: LetterGuessState;
  onKeyHit: (letter: string) => void;
}

const Key: React.FC<KeyProps> = ({ letter, keyState, onKeyHit }) => {
  return (
    <button
      className={`key ${getKeyCssClass(keyState)}`}
      onClick={() => onKeyHit(letter)}
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
  onKeyHit: (letter: string) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyHit }) => {
  const [playerKeyboard] = useRecoilState(playerLetterGuessState);

  return (
    <div className="keyboard-container">
      {KEYS.map((row, index) => (
        <div key={index} className="keyboard-row">
          {row.map((letter) => (
            <Key
              key={letter}
              letter={letter}
              keyState={playerKeyboard[letter]}
              onKeyHit={onKeyHit}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
