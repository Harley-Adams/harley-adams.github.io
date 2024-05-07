import React from "react";
import WordGuessGame from "../WordGuessPage/WordGuessGame";
import { PickRandomWord } from "../WordGuessPage/GameLogic/PickRandomWord";
import { GameMenu } from "./GameMenu";
import { atom, useRecoilState } from "recoil";

export enum PuzzleTimeGameModes {
  MainMenu,
  WordGuessSingle,
  WordGuessMulti,
}

export const currentGameMode = atom<PuzzleTimeGameModes>({
  key: "currentGameMode",
  default: PuzzleTimeGameModes.MainMenu,
});

export const PuzzleTimePage: React.FC = () => {
  const [gameMode] = useRecoilState(currentGameMode);

  if (gameMode === PuzzleTimeGameModes.WordGuessSingle) {
    return (
      <div>
        <WordGuessGame
          wordProp={PickRandomWord(5)}
          gameCompleteCallback={() => {}}
        />
      </div>
    );
  }

  return <GameMenu />;
};
