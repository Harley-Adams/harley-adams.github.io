import { useRecoilState } from "recoil";
import { GuessHistory } from "./GuessHistory";
import { otherPlayerLetterGuessState } from "../WordleState";

const OtherPlayersView: React.FC = () => {
  const [otherPlayers] = useRecoilState(otherPlayerLetterGuessState);

  if (!otherPlayers || Object.keys(otherPlayers).length === 0) {
    return null;
  }

  const mapOtherPlayers = Object.entries(otherPlayers).map(
    ([entityId, player]) => (
      <div key={entityId} className="player-item">
        {player.name}:
        <GuessHistory guessHistory={player.feedbackHistory ?? []} />
      </div>
    )
  );

  return (
    <div>
      <h2>Other Players</h2>
      <div className="players-container">{mapOtherPlayers}</div>
    </div>
  );
};

export default OtherPlayersView;
