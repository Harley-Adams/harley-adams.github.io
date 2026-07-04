/* On-screen keyboard with per-key coloring driven by cumulative guess results. */
import React from "react";
import { LetterState } from "./engine";
import { BackspaceIcon } from "../components/icons";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const keyStateClass: Record<LetterState, string> = {
  empty: "",
  tbd: "",
  absent: "pt-key-absent",
  present: "pt-key-present",
  correct: "pt-key-correct",
};

interface KeyboardProps {
  keyStates: Record<string, LetterState>;
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}

export default function Keyboard({
  keyStates,
  onLetter,
  onEnter,
  onBackspace,
}: KeyboardProps) {
  return (
    <div className="pt-keyboard">
      {ROWS.map((row, i) => (
        <div className="pt-key-row" key={i}>
          {i === 2 && (
            <button
              className="pt-key pt-key-wide"
              onClick={onEnter}
              aria-label="Enter"
            >
              ENTER
            </button>
          )}
          {row.split("").map((ch) => (
            <button
              key={ch}
              className={`pt-key ${keyStateClass[keyStates[ch] ?? "empty"]}`}
              onClick={() => onLetter(ch)}
              aria-label={ch}
            >
              {ch}
            </button>
          ))}
          {i === 2 && (
            <button
              className="pt-key pt-key-wide"
              onClick={onBackspace}
              aria-label="Backspace"
            >
              <BackspaceIcon />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
