import { useEffect, useState } from "react";
import PlayFabWrapper from "../PlayFab/PlayFabWrapper";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { PlayFabMultiplayerModels } from "../PlayFab/PlayFabMultiplayerModule";
import LobbyTable from "./LobbyTable";
import exp from "constants";
import { PlayFabPubSub } from "../PlayFab/PlayFabPubSub";

interface LobbyTableProps {
  player?: PfLoginResult;
}

const LobbyPage: React.FC<LobbyTableProps> = ({ player }) => {
  const pubsub: PlayFabPubSub = new PlayFabPubSub();
  const [lobbies, setLobbies] =
    useState<PlayFabMultiplayerModels.FindLobbiesResult>();
  const [showLobbyTable, setShowLobbyTable] = useState<boolean>(false);

  let pfClient = new PlayFabWrapper();

  const handleJoinLobby = (connectionString: string) => {
    if (player == null) {
      return;
    }

    pfClient.JoinLobby(player?.EntityToken, connectionString, (joinResult) => {
      console.log(joinResult);
    });
  };
  const handleCreateLobby = () => {
    if (player == null) {
      console.error("Player must be logged in to create a lobby");
      return;
    }

    let myObject: { [key: string]: string | null } = {
      key1: "value1",
      key2: null,
      key3: "value3",
    };

    // Example configuration for creating a lobby
    const lobbyData: { [key: string]: string | null } = {
      LobbyName: "New Lobby",
    };

    const memberData: PlayFabMultiplayerModels.Member[] = [
      { MemberEntity: player.EntityToken.Entity },
    ];

    pfClient.CreateLobby(
      player.EntityToken,
      false,
      lobbyData,
      memberData,
      (createLobbyResult) => {
        console.log("Lobby created:", createLobbyResult);
      }
    );
  };

  const handleCreateLobbyAndSub = () => {
    if (player == null) {
      console.error("Player must be logged in to create a lobby");
      return;
    }

    let myObject: { [key: string]: string | null } = {
      key1: "value1",
      key2: null,
      key3: "value3",
    };

    // Example configuration for creating a lobby
    const lobbyData: { [key: string]: string | null } = {
      LobbyName: "New Lobby",
    };

    const memberData: PlayFabMultiplayerModels.Member[] = [
      { MemberEntity: player.EntityToken.Entity },
    ];

    pfClient.CreateLobby(
      player.EntityToken,
      true,
      lobbyData,
      memberData,
      (createLobbyResult) => {
        console.log("Lobby created:", createLobbyResult);
        pubsub.NegotiateToPubSub(player.EntityToken, (result) => {
          pubsub.ConnectToPubSub(result.url, result.accessToken, () => {
            pubsub.StartOrRecoverSession((startResponse) => {
              pfClient.SubscribeToLobby(
                player.EntityToken,
                startResponse.newConnectionHandle,
                createLobbyResult.LobbyId,
                () => {
                  console.log(result);
                }
              );
            });
          });
        });
      }
    );
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

  const handleConnectToPubSub = () => {
    if (player != null) {
      pubsub.NegotiateToPubSub(player.EntityToken, (result) => {
        console.log(result);
        pubsub.ConnectToPubSub(result.url, result.accessToken, () => {
          pubsub.StartOrRecoverSession((response) => {
            console.log(response);
          });
        });
      });
    }
  };

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
        <button onClick={handleConnectToPubSub}>Connect to PubSub</button>
      </div>

      <LobbyTable
        player={player}
        lobbies={lobbies?.Lobbies || []}
        onJoinLobby={handleJoinLobby}
      />
    </div>
  );
};

export default LobbyPage;
