import { useState } from "react";
import WordGuessGame from "./WordGuessGame";
import "./WordGuessPage.css"; // You can define your styles here
import { WordList } from "./WordList";

import "react-toastify/dist/ReactToastify.css";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import React from "react";
import LoginUI from "./LoginUI";

function WordGuessPage(): JSX.Element {
  const [player, setPlayer] = useState<PfLoginResult>();
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const handleGameStart = () => {
    setGameStarted(true);
  };

  const handlePostGameDone = () => {
    setGameStarted(false);
  };

  let randomIndex = Math.floor(Math.random() * WordList.length);
  let word = WordList[randomIndex];
  word = "grace"; // for testing
  if (!player) {
    return <LoginUI setPlayer={setPlayer} />;
  }

  if (!gameStarted) {
    return (
      <div className="pregame-container">
        <button onClick={handleGameStart}>Start Game</button>
        <button>View Stats</button>
        <button>View Leaderboards</button>
      </div>
    );
  }

  return (
    <WordGuessGame word={word} gameCompleteCallback={handlePostGameDone} />
  );
}

export default WordGuessPage;
