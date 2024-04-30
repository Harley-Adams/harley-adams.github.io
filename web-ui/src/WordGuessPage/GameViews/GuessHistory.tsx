import { GuessFeedback, LetterGuessState } from "../GameLogic/Guess";

interface GuessHistoryProps {
  guessHistory: GuessFeedback[];
}

export const GuessHistory: React.FC<GuessHistoryProps> = (props) => {
  return (
    <div className="previous-guesses">
      {props.guessHistory.map((prevGuess, index) => (
        <div key={index} className="prev-guess">
          <div className="word-container">
            {prevGuess.lettersFeedback.map((feedback, index) => (
              <div
                key={index}
                className={`letter-box ${
                  feedback.state === LetterGuessState.Correct
                    ? "correct-letter animate-correct"
                    : feedback.state === LetterGuessState.WrongPosition
                    ? "wrong-position-letter animate-wrong-position"
                    : "wrong-letter animate-wrong"
                }`}
              >
                {feedback.letter}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
