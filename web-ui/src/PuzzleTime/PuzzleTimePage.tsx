import React, { useState } from "react";
import WordGuessGame from "../WordGuessPage/WordGuessGame";
import { PickRandomWord } from "../WordGuessPage/GameLogic/PickRandomWord";
import { GameMenu } from "./GameMenu";
import { useResetRecoilState } from "recoil";
import {
  playerGuessHistory,
  playerLetterGuessState,
} from "../WordGuessPage/WordleState";

export const PuzzleTimePage: React.FC = () => {
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const GameStart = () => {
    setGameStarted(true);
  };

  if (gameStarted) {
    return (
      <div>
        <WordGuessGame
          wordProp={PickRandomWord(5)}
          gameCompleteCallback={() => {
            setGameStarted(false);
          }}
        />
      </div>
    );
  }

  return <GameMenu setGameStart={GameStart} />;
};
