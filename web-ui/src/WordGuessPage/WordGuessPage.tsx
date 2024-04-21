import { useEffect, useState } from "react";
import WordGuessGame from "./WordGuessGame";
import "./WordGuessPage.css"; // You can define your styles here
import { WordList } from "./WordList";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PlayFabWrapper, { loginWithCustomId } from "../PlayFab/PlayFabWrapper";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { PlayFabMultiplayerModels } from "../PlayFab/PlayFabMultiplayerModule";

function WordGuessPage(): JSX.Element {
  let randomIndex = Math.floor(Math.random() * WordList.length);
  let word = WordList[randomIndex];
  const [player, setPlayer] = useState<PfLoginResult>();
  const [gameStarted, setGameStarted] = useState(false);
  // Player is host of their own game, only becomes false if they join another lobby.

  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [playerIsHost, setPlayerIsHost] = useState(true);
  const titleId = "A691C";
  let pfClient = new PlayFabWrapper();

  useEffect(() => {
    // Retrieve data from local storage to reduce throttling on login with customId.
    const storedPfLoginResult = localStorage.getItem("PfLoginResult");

    // Check stored time, if token is still valid for at least an hour, use it.
    if (storedPfLoginResult != null) {
      let storedLoginResult: PfLoginResult = JSON.parse(storedPfLoginResult);
      let tokenExpiration = Date.parse(
        storedLoginResult.EntityToken.TokenExpiration
      );
      const oneHourFromNow = Date.now() + 60 * 60 * 1000;

      if (tokenExpiration >= oneHourFromNow) {
        setPlayer(storedLoginResult);
        return;
      }
    }

    console.log("Logging in with custom ID");
    loginWithCustomId("testCustomId", (loginResult) => {
      localStorage.setItem("PfLoginResult", JSON.stringify(loginResult));
      setPlayer(loginResult);
    });
  }, []);

  const onJoinGamePress = () => {
    if (player == null) {
      console.error("Player must be logged in to join a game");
      return;
    }

    pfClient.GetLobbies(player?.EntityToken, (lobbies) => {
      if (lobbies.Lobbies.length > 0) {
        console.log(lobbies.Lobbies[0].ConnectionString);
        pfClient.JoinLobby(
          player?.EntityToken,
          lobbies.Lobbies[0].ConnectionString,
          (joinResult) => {
            console.log(joinResult);
            setPlayerIsHost(false);
            setIsMultiplayer(true);
          }
        );
      } else {
        const memberData: PlayFabMultiplayerModels.Member[] = [
          { MemberEntity: player.EntityToken.Entity },
        ];
        // Example configuration for creating a lobby
        const lobbyData: { [key: string]: string | null } = {
          LobbyName: "New Lobby",
        };

        // pfClient.CreateLobby(
        //   player?.EntityToken,
        //   lobbyData,
        //   memberData,
        //   (createResult) => {
        //     console.log(createResult);
        //     setPlayerIsHost(true);
        //     setIsMultiplayer(true);
        //   }
        // );
      }
    });
  };

  return (
    <div>
      <ToastContainer />
      {gameStarted ? (
        <WordGuessGame word={word} />
      ) : (
        <StartGameUI
          setGameStarted={setGameStarted}
          joinGame={onJoinGamePress}
          playerIsHost={playerIsHost}
          isMultiplayer={isMultiplayer}
        />
      )}
    </div>
  );
}

export default WordGuessPage;

interface StartGameUIProps {
  setGameStarted: (value: boolean) => void; // This prop is a function to set game started state
  joinGame: () => void;
  playerIsHost: boolean;
  isMultiplayer: boolean;
}

const StartGameUI: React.FC<StartGameUIProps> = (props) => {
  return (
    <div>
      {props.playerIsHost ? "You are host" : "You are not host"}
      {!props.isMultiplayer || props.playerIsHost ? (
        <button onClick={() => props.setGameStarted(true)}>Start Game</button>
      ) : (
        <div />
      )}
      {!props.isMultiplayer ? (
        <button onClick={() => props.joinGame()}>Join Game</button>
      ) : (
        <div />
      )}
    </div>
  );
};
