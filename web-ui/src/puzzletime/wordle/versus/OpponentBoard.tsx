/* A compact, letter-free view of an opponent's board (color states only). */
import React from "react";
import { CODE_STATE } from "./contract";
import { WORD_LENGTH, MAX_GUESSES } from "../engine";

const stateClass: Record<string, string> = {
  empty: "pt-mini-empty",
  tbd: "pt-mini-empty",
  absent: "pt-tile-absent",
  present: "pt-tile-present",
  correct: "pt-tile-correct",
};

interface Props {
  name: string;
  states: number[];
  solved: boolean;
  rank?: number | null;
}

export default function OpponentBoard({ name, states, solved, rank }: Props) {
  const cells: number[] = [];
  for (let i = 0; i < MAX_GUESSES * WORD_LENGTH; i++) {
    cells.push(states[i] ?? 0);
  }
  return (
    <div className={`pt-mini${solved ? " pt-mini-solved" : ""}`}>
      <div className="pt-mini-name">
        {rank != null && <span className="pt-mini-rank">{rank}</span>}
        <span className="pt-mini-label">{name}</span>
        {solved && <span className="pt-mini-check">✓</span>}
      </div>
      <div className="pt-mini-grid">
        {cells.map((code, i) => (
          <span key={i} className={`pt-mini-cell ${stateClass[CODE_STATE[code]]}`} />
        ))}
      </div>
    </div>
  );
}
