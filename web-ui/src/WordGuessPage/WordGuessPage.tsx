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
import BestGameLbView from "./BestGameLbView";
import TopPlayerLbView from "./TopPlayerLbView";

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
  // word = "grace"; // for testing
  if (!player) {
    return <LoginUI setPlayer={setPlayer} />;
  }

  if (!gameStarted) {
    return (
      <div className="pregame-container">
        <button onClick={handleGameStart}>Start Game</button>
        <StatisticsAndLeaderboardUX player={player} />
      </div>
    );
  }

  return (
    <div>
      <WordGuessGame
        player={player}
        word={word}
        gameCompleteCallback={handlePostGameDone}
      />
    </div>
  );
}

export default WordGuessPage;

interface StatisticsAndLeaderboardUXProps {
  player: PfLoginResult;
}

const StatisticsAndLeaderboardUX: React.FC<StatisticsAndLeaderboardUXProps> = ({
  player,
}) => {
  const [showBestLeaderboard, setShowBestLeaderboard] =
    useState<boolean>(false);
  const [showTopLeaderboard, setShowTopLeaderboard] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [leaderboardNameToShow, setLeaderboardNameToShow] =
    useState<string>("");
  const [showStatistics, setShowStatistics] = useState<boolean>(false);

  const handleShowPlayerStatistics = () => {
    setShowStatistics(true);
    setShowLeaderboard(false);
  };

  const handleShowLeaderboard = (leaderboardName: string) => {
    setLeaderboardNameToShow(leaderboardName);
    setShowLeaderboard(true);
    setShowStatistics(false);
  };
  const handleShowBestLeaderboard = (leaderboardName: string) => {
    setLeaderboardNameToShow(leaderboardName);
    setShowLeaderboard(false);
    setShowStatistics(false);
    setShowBestLeaderboard(true);
    setShowTopLeaderboard(false);
  };
  const handleShowTopLeaderboard = (leaderboardName: string) => {
    setLeaderboardNameToShow(leaderboardName);
    setShowLeaderboard(false);
    setShowStatistics(false);
    setShowBestLeaderboard(false);
    setShowTopLeaderboard(true);
  };

  return (
    <div>
      <div>
        <button onClick={handleShowPlayerStatistics}>View Stats</button>
        <button onClick={() => handleShowBestLeaderboard("WordleBestGame")}>
          View WordleBestGame Leaderboard
        </button>
        <button
          onClick={() => handleShowBestLeaderboard("WordleBestGameDaily")}
        >
          View WordleBestGameDaily Leaderboard
        </button>
        <button onClick={() => handleShowTopLeaderboard("WordleTopPlayers")}>
          View WordleTopPlayers Leaderboard
        </button>
        <button
          onClick={() => handleShowTopLeaderboard("WordleTopPlayersDaily")}
        >
          View WordleTopPlayersDaily Leaderboard
        </button>
      </div>
      {showLeaderboard ? (
        <LeaderboardView
          player={player}
          leaderboardName={leaderboardNameToShow}
        />
      ) : null}
      {showBestLeaderboard ? (
        <BestGameLbView
          player={player}
          leaderboardName={leaderboardNameToShow}
        />
      ) : null}
      {showTopLeaderboard ? (
        <TopPlayerLbView
          player={player}
          leaderboardName={leaderboardNameToShow}
        />
      ) : null}
      {showStatistics ? <StatisticsView player={player} /> : null}
    </div>
  );
};
