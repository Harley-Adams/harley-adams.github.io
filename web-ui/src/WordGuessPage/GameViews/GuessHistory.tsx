import { GuessFeedback } from "../WordleContract";
import { GuessRow } from "./GuessRow";

interface GuessHistoryProps {
  guessHistory: GuessFeedback[];
}

export const GuessHistory: React.FC<GuessHistoryProps> = (props) => {
  return (
    <div className="previous-guesses">
      {props.guessHistory.map((prevGuess, index) => (
        <GuessRow key={index} guessFeedback={prevGuess} index={index} />
      ))}
    </div>
  );
};
