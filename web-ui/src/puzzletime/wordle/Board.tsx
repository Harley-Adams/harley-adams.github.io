/* The 6×5 tile grid. Rows shake on an invalid guess; tiles color on submit. */
import React from "react";
import { LetterCell, LetterState } from "./engine";

const stateClass: Record<LetterState, string> = {
  empty: "pt-tile-empty",
  tbd: "pt-tile-tbd",
  absent: "pt-tile-absent",
  present: "pt-tile-present",
  correct: "pt-tile-correct",
};

function Tile({ cell }: { cell: LetterCell }) {
  return (
    <div className={`pt-tile ${stateClass[cell.state]}`}>
      {cell.letter ?? ""}
    </div>
  );
}

interface BoardProps {
  guesses: LetterCell[][];
  shakeRow: number | null;
}

export default function Board({ guesses, shakeRow }: BoardProps) {
  return (
    <div className="pt-board" role="grid" aria-label="Wordle board">
      {guesses.map((row, r) => (
        <div
          key={r}
          className={`pt-board-row${shakeRow === r ? " pt-shake" : ""}`}
          role="row"
        >
          {row.map((cell, c) => (
            <Tile key={c} cell={cell} />
          ))}
        </div>
      ))}
    </div>
  );
}
