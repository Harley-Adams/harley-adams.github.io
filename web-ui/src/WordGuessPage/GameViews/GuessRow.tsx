import { GuessFeedback, LetterGuessState } from "../WordleContract";

interface GuessRowProps {
  guessFeedback: GuessFeedback;
  index: number;
}

export const GuessRow: React.FC<GuessRowProps> = ({ guessFeedback, index }) => {
  return (
    <div key={index} className="prev-guess">
      <div className="word-container">
        {guessFeedback.lettersFeedback.map((feedback, index) => (
          <div
            key={index}
            className={`letter-box ${getSquareClass(feedback.state)}`}
          >
            {feedback.letter}
          </div>
        ))}
      </div>
    </div>
  );
};

const getSquareClass = (state: LetterGuessState) => {
  switch (state) {
    case LetterGuessState.Correct:
      return "correct-letter";
    case LetterGuessState.WrongPosition:
      return "wrong-position-letter";
    case LetterGuessState.Wrong:
      return "wrong-letter";
    default:
      return "unused-letter";
  }
};
