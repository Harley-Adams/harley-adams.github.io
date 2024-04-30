import { toast } from "react-toastify";
import { Dictionary } from "../Data/Dictionary";

export const IsValidGuess = (
  currentGuess: string,
  wordLength: number
): boolean => {
  if (currentGuess.length !== wordLength) {
    toast.error("Guess should have the same length as the word.", {
      position: "top-center",
    });

    return false;
  }

  if (Dictionary.includes(currentGuess.toLowerCase()) === false) {
    toast.error("Guess is not a valid word.");

    return false;
  }

  return true;
};
