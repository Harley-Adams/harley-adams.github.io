import { useState } from "react";
import WordGuessGame from "./WordGuessGame";
import "./WordGuessPage.css"; // You can define your styles here

import "react-toastify/dist/ReactToastify.css";
import LoginUI from "./GameViews/LoginUI";
import { loggedInPlayerState } from "./WordleState";
import { useRecoilState } from "recoil";
import { PickRandomWord } from "./GameLogic/PickRandomWord";

function WordGuessPage(): JSX.Element {
  const [player] = useRecoilState(loggedInPlayerState);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [word, setWord] = useState<string>("grace");

  const handleGameStart = () => {
    setGameStarted(true);
    setWord(PickRandomWord(5));
  };

  const handlePostGameDone = () => {
    setGameStarted(false);
  };

  if (!player) {
    return <LoginUI />;
  }

  if (!gameStarted) {
    return (
      <div className="pregame-container">
        <button onClick={handleGameStart} className="start-game-button">
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div>
      <WordGuessGame
        wordProp={word}
        player={player}
        gameCompleteCallback={handlePostGameDone}
      />
    </div>
  );
}

export default WordGuessPage;
