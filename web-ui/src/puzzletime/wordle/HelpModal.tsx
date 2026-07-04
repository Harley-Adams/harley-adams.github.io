/* Help sheet — the Wordle rules, ported from PuzzleGuides.wordle. */
import React from "react";
import Modal from "../components/Modal";

interface Props {
  accent: string;
  onClose: () => void;
}

export default function HelpModal({ accent, onClose }: Props) {
  return (
    <Modal title="How to play" accent={accent} onClose={onClose}>
      <p className="pt-guide-tagline">
        Guess the hidden 5-letter word in six tries.
      </p>
      <ol className="pt-guide-steps">
        <li>Type any 5-letter word and submit it.</li>
        <li>
          <span className="pt-legend pt-tile-correct">A</span> right letter,
          right spot. <span className="pt-legend pt-tile-present">B</span> right
          letter, wrong spot. <span className="pt-legend pt-tile-absent">C</span>{" "}
          not in the word.
        </li>
        <li>Use those clues to narrow down the answer before your guesses run out.</li>
      </ol>
      <h3 className="pt-guide-h3">Tips</h3>
      <ul className="pt-guide-tips">
        <li>Open with a word rich in common letters and vowels.</li>
        <li>Reuse every confirmed green and yellow letter in your next guess.</li>
      </ul>
    </Modal>
  );
}
