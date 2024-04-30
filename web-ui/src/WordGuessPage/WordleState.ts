import { atom } from "recoil";
import { GuessFeedback, LetterGuessState } from "./GameLogic/Guess";
import { WordlePlayerContract } from "./WordleContract";
import PfLoginResult from "../PlayFab/models/PfLoginResult";

export type LetterDictionary = {
  [key in string]: LetterGuessState;
};

const initialState: LetterDictionary = {
  A: LetterGuessState.Unused,
  B: LetterGuessState.Unused,
  C: LetterGuessState.Unused,
  D: LetterGuessState.Unused,
  E: LetterGuessState.Unused,
  F: LetterGuessState.Unused,
  G: LetterGuessState.Unused,
  H: LetterGuessState.Unused,
  I: LetterGuessState.Unused,
  J: LetterGuessState.Unused,
  K: LetterGuessState.Unused,
  L: LetterGuessState.Unused,
  M: LetterGuessState.Unused,
  N: LetterGuessState.Unused,
  O: LetterGuessState.Unused,
  P: LetterGuessState.Unused,
  Q: LetterGuessState.Unused,
  R: LetterGuessState.Unused,
  S: LetterGuessState.Unused,
  T: LetterGuessState.Unused,
  U: LetterGuessState.Unused,
  V: LetterGuessState.Unused,
  W: LetterGuessState.Unused,
  X: LetterGuessState.Unused,
  Y: LetterGuessState.Unused,
  Z: LetterGuessState.Unused,
};

export const playerLetterGuessState = atom({
  key: "playerLetterGuess",
  default: initialState,
});

export type OtherPlayersState = {
  [key: string]: WordlePlayerContract;
};

export const otherPlayerLetterGuessState = atom<OtherPlayersState>({
  key: "otherPlayerLetterGuessState",
  default: {},
});

export const playerGuessHistory = atom<GuessFeedback[]>({
  key: "playerGuessHistory",
  default: [],
});

export const publicPlayerGuessHistory = atom<GuessFeedback[]>({
  key: "publicPlayerGuessHistory",
  default: [],
});

export const answerWordState = atom<string>({
  key: "answerWord",
  default: "",
});

export const currentLobbyIdState = atom<string>({
  key: "currentLobbyId",
  default: "",
});

export const loggedInPlayerState = atom<PfLoginResult | null>({
  key: "loggedInPlayer",
  default: null,
});

export const customIdState = atom<string>({
  key: "loggedInPlayerCustomId",
  default: "testuser",
});
