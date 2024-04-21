import React from "react";
import { PlayFabMultiplayerModels } from "../PlayFab/PlayFabMultiplayerModule";
import PlayFabWrapper from "../PlayFab/PlayFabWrapper";
import PfLoginResult from "../PlayFab/models/PfLoginResult";

interface LobbyTableProps {
  player?: PfLoginResult;
  lobbies: PlayFabMultiplayerModels.LobbySummary[];
  onJoinLobby: (connectionString: string) => void;
}

const LobbyTable: React.FC<LobbyTableProps> = ({
  player,
  lobbies,
  onJoinLobby,
}) => {
  const handleLeaveLobby = (lobbyId: string) => {
    const pfClient = new PlayFabWrapper();
    if (player) {
      console.log("Leave lobby", lobbyId);
      pfClient.LeaveLobby(player.EntityToken, lobbyId, (leaveResult) => {
        console.log("Lobby left:", leaveResult);
      });
    }
  };
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
          <th>Lobby ID</th>
          <th>Connection String</th>
          <th>Current Players</th>
          <th>Max Players</th>
          <th>Membership Lock</th>
          <th>Owner ID</th>
          <th>Search Data</th>
        </tr>
      </thead>
      <tbody>
        {lobbies.map((lobby, index) => (
          <tr key={index}>
            <td>{lobby.LobbyId}</td>
            <td>
              <button onClick={() => onJoinLobby(lobby.ConnectionString)}>
                Join Lobby
              </button>
            </td>
            <td>{lobby.CurrentPlayers}</td>
            <td>{lobby.MaxPlayers}</td>
            <td>{lobby.MembershipLock || "Not Locked"}</td>
            <td>{lobby.Owner.Id}</td>
            {/* <td>
              {lobby.SearchData
                ? Object.entries(lobby.SearchData)
                    .map(([key, value]) => `${key}: ${value || "N/A"}`)
                    .join(", ")
                : "No Search Data"}
            </td> */}
            <td>
              <button onClick={handleLeaveLobby.bind(null, lobby.LobbyId)}>
                Leave
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LobbyTable;
