import * as React from "react";

class Crossword extends React.Component<{}, {}> {
  render() {
    return (
      <div className="Crossword">
        <h1>Crosswords!</h1>
        <p>
          Login on page load, 1) try get cookie guid 2) create if no cookie guid
          3) login with customId that is cookie guid 4) call my api which gets a
          puzzle.
        </p>
      </div>
    );
  }
}

export default Crossword;
