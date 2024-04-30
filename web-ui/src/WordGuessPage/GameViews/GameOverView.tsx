import { useRecoilState } from "recoil";
import { answerWordState } from "../WordleState";

interface FinishedGameUIProps {
  onClickGameCompleteCallback: () => void;
}

const GameOverView: React.FC<FinishedGameUIProps> = ({
  onClickGameCompleteCallback,
}) => {
  const [word] = useRecoilState(answerWordState);
  return (
    <div>
      <h2>Game Over</h2>
      <p>The word was: {word}</p>
      <button onClick={onClickGameCompleteCallback}>Back to home screen</button>
    </div>
  );
};

export default GameOverView;
