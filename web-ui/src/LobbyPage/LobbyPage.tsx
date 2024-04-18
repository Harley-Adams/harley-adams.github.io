import { useEffect, useState } from "react";
import PlayFabWrapper from "../PlayFab/PlayFabWrapper";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { PlayFabMultiplayerModels } from "../PlayFab/PlayFabMultiplayerModule";
import LobbyTable from "./LobbyTable";

function LobbyPage(): JSX.Element {
  const [player, setPlayer] = useState<PfLoginResult>();
  const [lobbies, setLobbies] =
    useState<PlayFabMultiplayerModels.FindLobbiesResult>();
  const [showLobbyTable, setShowLobbyTable] = useState<boolean>(false);

  let pfClient = new PlayFabWrapper("A691C", "", true);

  useEffect(() => {
    // Retrieve data from local storage to reduce throttling on login with customId.
    const storedPfLoginResult = localStorage.getItem("PfLoginResult");
    if (storedPfLoginResult != null) {
      setPlayer(JSON.parse(storedPfLoginResult));
    } else {
      console.log("Logging in with custom ID");
      pfClient.LoginWithCustomId("testCustomId", (loginResult) => {
        localStorage.setItem("PfLoginResult", JSON.stringify(loginResult));
        //   setPlayer(loginResult);
      });
    }
  }, []);

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
      lobbyData,
      memberData,
      (result) => {
        console.log("Lobby created:", result);
        // Optionally update the state to include the new lobby
      }
    );
  };

  const handleFindLobbies = () => {
    if (player != null) {
      console.log("Finding lobbies");
      pfClient.GetLobbies(player.EntityToken, (lobbies) => {
        setLobbies(lobbies);
        setShowLobbyTable(true);
      });
    }
  };

  return (
    <div>
      <h1>Lobby Page</h1>
      <br />
      <button onClick={handleFindLobbies}>Find lobbies</button>
      <button onClick={handleCreateLobby}>Create New Lobby</button>
      <LobbyTable
        lobbies={lobbies?.Lobbies || []}
        onJoinLobby={handleJoinLobby}
      />
    </div>
  );
}

export default LobbyPage;
