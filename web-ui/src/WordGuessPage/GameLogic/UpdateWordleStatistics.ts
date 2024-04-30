import { UpdateStatistics } from "../../PlayFab/PlayFabWrapper";
import PfLoginResult from "../../PlayFab/models/PfLoginResult";
import { StatisticUpdate } from "../../PlayFab/modules/PlayFabLeaderboardsModule";
import { GuessFeedback, LetterGuessState } from "../WordleContract";

export const UpdateWordleStatistics = (
  player: PfLoginResult,
  timeTaken: number,
  answerWord: string,
  guessHistory: GuessFeedback[]
) => {
  let numberOfWrongLetters = 0;
  let numberOfMisplacedLetters = 0;

  guessHistory.forEach((guess) => {
    guess.lettersFeedback.forEach((letterFeedback) => {
      if (letterFeedback.state === LetterGuessState.Wrong) {
        numberOfWrongLetters++;
      }
      if (letterFeedback.state === LetterGuessState.WrongPosition) {
        numberOfMisplacedLetters++;
      }
    });
  });

  const statUpdatePayload: StatisticUpdate[] = [
    {
      Name: "WordleBestGame",
      Metadata: answerWord,
      Scores: [
        guessHistory.length.toString(),
        timeTaken.toString(),
        numberOfWrongLetters.toString(),
        numberOfMisplacedLetters.toString(),
      ],
    },
    {
      Name: "WordleBestGameDaily",
      Metadata: answerWord,
      Scores: [
        guessHistory.length.toString(),
        timeTaken.toString(),
        numberOfWrongLetters.toString(),
        numberOfMisplacedLetters.toString(),
      ],
    },
    {
      Name: "WordleTopPlayers",
      Scores: [
        "1",
        guessHistory.length.toString(),
        timeTaken.toString(),
        numberOfWrongLetters.toString(),
        numberOfMisplacedLetters.toString(),
      ],
    },
    {
      Name: "WordleTopPlayersDaily",
      Scores: [
        "1",
        guessHistory.length.toString(),
        timeTaken.toString(),
        numberOfWrongLetters.toString(),
        numberOfMisplacedLetters.toString(),
      ],
    },
  ];

  UpdateStatistics(player.EntityToken, statUpdatePayload);
};
