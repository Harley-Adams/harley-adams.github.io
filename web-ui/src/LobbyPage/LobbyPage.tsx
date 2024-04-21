import { useState } from "react";
import PlayFabWrapper, { loginWithCustomId } from "../PlayFab/PlayFabWrapper";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { PlayFabMultiplayerModels } from "../PlayFab/PlayFabMultiplayerModule";
import LobbyTable from "./LobbyTable";
import { PlayFabPubSub } from "../PlayFab/PlayFabPubSub";

const LobbyPage: React.FC = () => {
  const [player, setPlayer] = useState<PfLoginResult>();
  const [customIdInput, setCustomIdInput] = useState<string>("testuser");

  const pubsub: PlayFabPubSub = new PlayFabPubSub();
  const [lobbies, setLobbies] =
    useState<PlayFabMultiplayerModels.FindLobbiesResult>();
  const [showLobbyTable, setShowLobbyTable] = useState<boolean>(false);

  let pfClient = new PlayFabWrapper();
  let lobbyId: string = "";

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
      lobbyId = joinResult.LobbyId;
    });
  };
  const handleCreateLobby = () => {
    if (player == null) {
      console.error("Player must be logged in to create a lobby");
      return;
    }

    const memberData: PlayFabMultiplayerModels.Member[] = [
      { MemberEntity: player.EntityToken.Entity },
    ];

    pfClient.CreateLobby(player.EntityToken, false, {}, memberData, () => {});
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
      {},
      memberData,
      (createLobbyResult) => {
        lobbyId = createLobbyResult.LobbyId;
        pubsub.NegotiateToPubSub(player.EntityToken, (result) => {
          pubsub.ConnectToPubSub(
            result.url,
            result.accessToken,
            () => {
              pubsub.StartOrRecoverSession((startResponse) => {
                lobbyId = createLobbyResult.LobbyId;
                pfClient.SubscribeToLobby(
                  player.EntityToken,
                  startResponse.newConnectionHandle,
                  createLobbyResult.LobbyId,
                  () => {}
                );
              });
            },
            (message) => {
              // const payload = JSON.parse(message.payload);
              console.log(
                "Received message",
                JSON.parse(atob(message.payload))
              );
            }
          );
        });
      }
    );
  };

  const handleUpdateLobby = () => {
    if (player) {
      pfClient.UpdateLobby(
        player.EntityToken,
        lobbyId,
        (updateResult) => {
          console.log("Lobby updated:", updateResult);
        },
        { "New Lobby Name": "lobbyName" }
      );
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
        <button onClick={handleCreateLobby}>Create New Lobby</button>
        <button onClick={handleCreateLobbyAndSub}>
          Create New Lobby and Subscribe via PubSub
        </button>
        <button onClick={handleUpdateLobby}>Update Lobby</button>
      </div>
      {showLobbyTable ? (
        <LobbyTable
          player={player}
          lobbies={lobbies?.Lobbies || []}
          onJoinLobby={handleJoinLobby}
        />
      ) : null}
    </div>
  );
};

export default LobbyPage;
