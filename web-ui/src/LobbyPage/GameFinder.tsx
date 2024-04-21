import { useState } from "react";
import PlayFabWrapper, { loginWithCustomId } from "../PlayFab/PlayFabWrapper";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { PlayFabMultiplayerModels } from "../PlayFab/PlayFabMultiplayerModule";
import LobbyTable from "./LobbyTable";
import { PlayFabPubSub } from "../PlayFab/PlayFabPubSub";

interface GameFinderProps {
  pubsub: PlayFabPubSub;
}

const GameFinder: React.FC<GameFinderProps> = ({ pubsub }) => {
  const [player, setPlayer] = useState<PfLoginResult>();
  const [customIdInput, setCustomIdInput] = useState<string>("testuser");
  const [lobbies, setLobbies] =
    useState<PlayFabMultiplayerModels.FindLobbiesResult>();
  const [showLobbyTable, setShowLobbyTable] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [lobbyId, setLobbyId] = useState<string>(""); // [1

  let pfClient = new PlayFabWrapper();
  const handleLogin = () => {
    loginWithCustomId(customIdInput, (loginResult) => {
      setPlayer(loginResult);
    });
  };

  const handleJoinLobby = (connectionString: string) => {
    if (player == null) {
      return;
    }

    pfClient.JoinLobby(player?.EntityToken, connectionString, (joinResult) => {
      console.log(joinResult);
      setLobbyId(joinResult.LobbyId);
    });
  };

  const handleCreateLobbyAndSub = () => {
    if (player == null) {
      console.error("Player must be logged in to create a lobby");
      return;
    }

    const memberData: PlayFabMultiplayerModels.Member[] = [
      { MemberEntity: player.EntityToken.Entity },
    ];

    pfClient.CreateLobby(
      player.EntityToken,
      true,
      { GameState: "pregame" },
      memberData,
      (createLobbyResult) => {
        setLobbyId(createLobbyResult.LobbyId);
        setIsHost(true);
        pubsub.NegotiateToPubSub(player.EntityToken, (result) => {
          pubsub.ConnectToPubSub(
            result.url,
            result.accessToken,
            () => {
              pubsub.StartOrRecoverSession((startResponse) => {
                pfClient.SubscribeToLobby(
                  player.EntityToken,
                  startResponse.newConnectionHandle,
                  createLobbyResult.LobbyId,
                  () => {}
                );
              });
            },
            (message) => {
              const payload = atob(message.payload);
              const lobbyUpdate = JSON.parse(atob(message.payload));
              console.log(`Received message: ${payload}`);
              console.log(
                `attempted deserialize: ${lobbyUpdate.lobbyChanges[0].lobbyData.GameState}`
              );
              if (
                lobbyUpdate.lobbyChanges[0].lobbyData.GameState == "started"
              ) {
                setIsGameStarted(true);
              }
            }
          );
        });
      }
    );
  };

  const handleStartGame = () => {
    if (player) {
      pfClient.UpdateLobby(player.EntityToken, lobbyId, (updateResult) => {}, {
        GameState: "ingame",
      });
    }
  };

  const handleFindLobbies = () => {
    if (player != null) {
      console.log("Finding lobbies");
      pfClient.GetLobbies(player.EntityToken, (lobbies) => {
        console.log(lobbies);
        setLobbies(lobbies);
        setShowLobbyTable(true);
      });
    }
  };

  const handleCustomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomIdInput(event.target.value); // Convert the guess to uppercase
  };

  if (!player) {
    return (
      <div>
        <input
          type="text"
          defaultValue={customIdInput}
          onChange={handleCustomIdChange}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }
  return (
    <div>
      <h1>Lobby Page</h1>
      <br />
      <div className="lobbyButtons">
        <button onClick={handleFindLobbies}>Find lobbies</button>
        <button onClick={handleCreateLobbyAndSub}>Create New Lobby</button>
      </div>
      {showLobbyTable ? (
        <LobbyTable
          player={player}
          lobbies={lobbies?.Lobbies || []}
          onJoinLobby={handleJoinLobby}
        />
      ) : null}
      {isHost ? <button onClick={handleStartGame}>StartGame</button> : null}
      {isGameStarted ? <h1>Game Started</h1> : null}
    </div>
  );
};

export default GameFinder;
