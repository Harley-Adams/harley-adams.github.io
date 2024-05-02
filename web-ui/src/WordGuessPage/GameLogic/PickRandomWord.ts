import { Dictionary } from "../Data/Dictionary";
import { FiveLetterWordList } from "../Data/FiveLetterWordList";

export const PickRandomWord = (wordLength: number): string => {
  if (wordLength == 5) {
    let randomIndex = Math.floor(Math.random() * FiveLetterWordList.length);
    return FiveLetterWordList[randomIndex].toUpperCase();
  }
  const potentialWords = Dictionary.filter(
    (word) => word.length === wordLength
  );
  let randomIndex = Math.floor(Math.random() * potentialWords.length);

  return potentialWords[randomIndex].toUpperCase();
};
