import React, { useState } from "react";

// Define the layout of the QWERTY keyboard
const KEYS: string[][] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

interface KeyProps {
  letter: string;
  keyState: string;
  setKeyState: (letter: string, newState: string) => void;
}

const Key: React.FC<KeyProps> = ({ letter, keyState, setKeyState }) => {
  return (
    <button
      className={`key ${keyState}`}
      //   onClick={() => setKeyState(letter, nextKeyState(keyState))}
    >
      {letter}
    </button>
  );
};

interface KeyboardProps {
  keyStates: { [key: string]: string };
  setKeyState: (letter: string, newState: string) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ keyStates, setKeyState }) => {
  return (
    <div className="keyboard-container">
      {KEYS.map((row, index) => (
        <div key={index} className="keyboard-row">
          {row.map((letter) => (
            <Key
              key={letter}
              letter={letter}
              keyState={keyStates[letter]}
              setKeyState={setKeyState}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
