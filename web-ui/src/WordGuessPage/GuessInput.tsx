interface GuessInputProps {
  currentGuess: string;
  wordLength: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleGuessSubmit: () => void;
}

export const GuessInput: React.FC<GuessInputProps> = ({
  currentGuess,
  wordLength,
  handleInputChange,
  handleKeyDown,
  handleGuessSubmit,
}) => (
  <div className="guess-input">
    <input
      type="text"
      maxLength={wordLength}
      value={currentGuess}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
    />
    <button onClick={handleGuessSubmit}>Submit</button>
  </div>
);
