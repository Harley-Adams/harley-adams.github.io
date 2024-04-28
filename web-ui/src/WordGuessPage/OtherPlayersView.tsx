import { Guess } from "./GameLogic/Guess";
import { GuessHistory } from "./GuessHistory";

interface OtherPlayersViewProps {
  otherPlayers: OtherPlayer[];
}

interface OtherPlayer {
  name: string;
  guesses: Guess[];
}

export const OtherPlayersView: React.FC<OtherPlayersViewProps> = (props) => {
  return (
    <div>
      {props.otherPlayers.map((player, index) => (
        <div key={index}>
          <h3>{player.name}</h3>
          <ul>
            <GuessHistory guessHistory={player.guesses} />
          </ul>
        </div>
      ))}
    </div>
  );
};
