/* A compact, letter-free view of an opponent's board — color marks only, so a
 * letter is never leaked. Marks match the cross-play contract: correct=0,
 * present=1, absent=2, neutral=3. */
import React from "react";
import { ProgressMark } from "../../net/snapshot";
import { WORD_LENGTH, MAX_GUESSES } from "../engine";

const markClass: Record<number, string> = {
  0: "pt-tile-correct",
  1: "pt-tile-present",
  2: "pt-tile-absent",
  3: "pt-mini-empty",
};

interface Props {
  name: string;
  rows: ProgressMark[][];
  solved: boolean;
  rank?: number | null;
}

export default function OpponentBoard({ name, rows, solved, rank }: Props) {
  const cells: number[] = [];
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = rows[r];
    for (let c = 0; c < WORD_LENGTH; c++) {
      cells.push(row ? row[c] ?? 3 : 3);
    }
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
          <span key={i} className={`pt-mini-cell ${markClass[code]}`} />
        ))}
      </div>
    </div>
  );
}
