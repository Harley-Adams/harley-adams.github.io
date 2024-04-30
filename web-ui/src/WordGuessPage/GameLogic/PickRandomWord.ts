import { Dictionary } from "../Data/Dictionary";

export const PickRandomWord = (wordLength: number): string => {
  const potentialWords = Dictionary.filter(
    (word) => word.length === wordLength
  );
  let randomIndex = Math.floor(Math.random() * potentialWords.length);

  return potentialWords[randomIndex].toUpperCase();
};
