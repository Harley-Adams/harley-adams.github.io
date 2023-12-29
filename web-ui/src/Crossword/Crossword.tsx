import * as React from "react";
import "./crossword.css";
import WordGuesser from "./WordGueser";
import CrosswordGrid from "./CrosswordGrid";

interface Props {
  rows: string[];
}

class Crossword extends React.Component<{}, {}> {
  render() {
    let hardcodedWords = ["hello", "itisme", "thisisaword"];

    return (
      <div className="Crossword">
        <h1>Crosswords!</h1>
        <p>
          Login on page load, 1) try get cookie guid 2) create if no cookie guid
          3) login with customId that is cookie guid 4) call my api which gets a
          puzzle.
        </p>
        <CrosswordGrid words={hardcodedWords} />
        <WordGuesser partialWord="" answerId={null} clue={null} />
      </div>
    );
  }
}

export default Crossword;
