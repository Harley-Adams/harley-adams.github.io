import { useState } from "react";
import WordGuessGame from "./WordGuessGame";
import "./WordGuessPage.css"; // You can define your styles here
import { WordList } from "./WordList";

import "react-toastify/dist/ReactToastify.css";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import React from "react";
import LoginUI from "./LoginUI";
import LeaderboardView from "./LeaderboardView";
import StatisticsView from "./StatisticsView";

function WordGuessPage(): JSX.Element {
  const [player, setPlayer] = useState<PfLoginResult>();
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [leaderboardNameToShow, setLeaderboardNameToShow] =
    useState<string>("");
  const [showStatistics, setShowStatistics] = useState<boolean>(false);

  const handleGameStart = () => {
    setGameStarted(true);
  };

  const handlePostGameDone = () => {
    setGameStarted(false);
  };

  const handleShowPlayerStatistics = () => {
    setShowStatistics(true);
  };

  const handleShowLeaderboard = (leaderboardName: string) => {
    setLeaderboardNameToShow(leaderboardName);
    setShowLeaderboard(true);
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
        {/* <button onClick={handleShowPlayerStatistics}>View Stats</button> */}
        <button onClick={() => handleShowLeaderboard("WordleBestGame")}>
          View WordleBestGame Leaderboard
        </button>
        <button onClick={() => handleShowLeaderboard("WordleBestGameDaily")}>
          View WordleBestGameDaily Leaderboard
        </button>
        <button onClick={() => handleShowLeaderboard("WordleTopPlayers")}>
          View WordleTopPlayers Leaderboard
        </button>
        <button onClick={() => handleShowLeaderboard("WordleTopPlayersDaily")}>
          View WordleTopPlayersDaily Leaderboard
        </button>
        {showLeaderboard ? (
          <LeaderboardView
            player={player}
            leaderboardName={leaderboardNameToShow}
          />
        ) : null}
        {showStatistics ? <StatisticsView player={player} /> : null}
      </div>
    );
  }

  return (
    <WordGuessGame
      player={player}
      word={word}
      gameCompleteCallback={handlePostGameDone}
    />
  );
}

export default WordGuessPage;
