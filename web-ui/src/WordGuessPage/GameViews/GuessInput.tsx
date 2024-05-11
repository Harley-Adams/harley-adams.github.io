import { TextField } from "@mui/material";

interface GuessInputProps {
  currentGuess: string;
  wordLength: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleGuessSubmit: () => void;
  handleBackspace: () => void;
}

export const GuessInput: React.FC<GuessInputProps> = ({
  currentGuess,
  wordLength,
  handleInputChange,
  handleKeyDown,
  handleGuessSubmit,
  handleBackspace,
}) => (
  <div className="guess-input">
    <input
      type="text"
      maxLength={wordLength}
      value={currentGuess}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      className="guessInputField"
    />
    <button className="submitButton" onClick={handleGuessSubmit}>
      Submit
    </button>
    <button className="backspaceButton" onClick={handleBackspace}>
      Backspace
    </button>
  </div>
);
