import { useState } from "react";
import WordGuessGame from "./WordGuessGame";
import "./WordGuessPage.css"; // You can define your styles here
import { WordList } from "./Data/WordList";

import "react-toastify/dist/ReactToastify.css";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import React from "react";
import LoginUI from "./LoginUI";
import LeaderboardView from "./LeaderboardViews/LeaderboardView";
import StatisticsView from "./LeaderboardViews/StatisticsView";
import BestGameLbView from "./LeaderboardViews/BestGameLbView";
import TopPlayerLbView from "./LeaderboardViews/TopPlayerLbView";

function WordGuessPage(): JSX.Element {
  const [customId, setCustomId] = useState<string>("testuser");
  const [word, setWord] = useState<string>("");
  const [player, setPlayer] = useState<PfLoginResult>();
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const handleGameStart = () => {
    if (customId === "harley") {
      setWord("grace");
    } else {
      let randomIndex = Math.floor(Math.random() * WordList.length);
      let wordFromList = WordList[randomIndex];
      setWord(wordFromList);
    }
    setGameStarted(true);
  };

  const handlePostGameDone = () => {
    setGameStarted(false);
  };

  // word = "grace"; // for testing
  if (!player) {
    return <LoginUI setPlayer={setPlayer} setCustomId={setCustomId} />;
  }

  if (!gameStarted) {
    return (
      <div className="pregame-container">
        <button onClick={handleGameStart} className="start-game-button">
          Start Game
        </button>
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
  const [version, setVersion] = useState<number>(0);

  const handleShowPlayerStatistics = () => {
    setShowStatistics(true);
    setShowLeaderboard(false);
    setShowBestLeaderboard(false);
    setShowTopLeaderboard(false);
  };

  const handleShowLeaderboard = (leaderboardName: string, version?: number) => {
    setVersion(version || 0);
    setLeaderboardNameToShow(leaderboardName);
    setShowLeaderboard(true);
    setShowStatistics(false);
  };
  const handleShowBestLeaderboard = (
    leaderboardName: string,
    version?: number
  ) => {
    setVersion(version || 0);
    setLeaderboardNameToShow(leaderboardName);
    setShowLeaderboard(false);
    setShowStatistics(false);
    setShowBestLeaderboard(true);
    setShowTopLeaderboard(false);
  };
  const handleShowTopLeaderboard = (
    leaderboardName: string,
    version?: number
  ) => {
    setVersion(version || 0);
    setLeaderboardNameToShow(leaderboardName);
    setShowLeaderboard(false);
    setShowStatistics(false);
    setShowBestLeaderboard(false);
    setShowTopLeaderboard(true);
  };

  return (
    <div>
      <div className="lb-buttons">
        <button onClick={handleShowPlayerStatistics}>View Stats</button>
        {/* <button onClick={() => handleShowLeaderboard("WordleBestGame", 0)}>
          View Leaderboard
        </button> */}
        <button onClick={() => handleShowBestLeaderboard("WordleBestGame", 0)}>
          View WordleBestGame Leaderboard
        </button>
        <button
          onClick={() => handleShowBestLeaderboard("WordleBestGameDaily", 1)}
        >
          View WordleBestGameDaily Leaderboard
        </button>
        <button
          onClick={() => handleShowBestLeaderboard("WordleBestGameDaily", 0)}
        >
          View yesterday's WordleBestGameDaily Leaderboard
        </button>
        <button onClick={() => handleShowTopLeaderboard("WordleTopPlayers", 0)}>
          View WordleTopPlayers Leaderboard
        </button>
        <button
          onClick={() => handleShowTopLeaderboard("WordleTopPlayersDaily", 1)}
        >
          View WordleTopPlayersDaily Leaderboard
        </button>
        <button
          onClick={() => handleShowTopLeaderboard("WordleTopPlayersDaily", 0)}
        >
          View yesterday's WordleTopPlayersDaily Leaderboard
        </button>
      </div>
      {showLeaderboard ? (
        <LeaderboardView
          player={player}
          leaderboardName={leaderboardNameToShow}
          version={version}
        />
      ) : null}
      {showBestLeaderboard ? (
        <BestGameLbView
          player={player}
          leaderboardName={leaderboardNameToShow}
          version={version}
        />
      ) : null}
      {showTopLeaderboard ? (
        <TopPlayerLbView
          player={player}
          leaderboardName={leaderboardNameToShow}
          version={version}
        />
      ) : null}
      {showStatistics ? <StatisticsView player={player} /> : null}
    </div>
  );
};
