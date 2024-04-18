import React from "react";
import { PlayFabMultiplayerModels } from "../PlayFab/PlayFabMultiplayerModule";

interface LobbyTableProps {
  lobbies: PlayFabMultiplayerModels.LobbySummary[];
  onJoinLobby: (connectionString: string) => void;
}

const LobbyTable: React.FC<LobbyTableProps> = ({ lobbies, onJoinLobby }) => {
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
            <td>
              {lobby.SearchData
                ? Object.entries(lobby.SearchData)
                    .map(([key, value]) => `${key}: ${value || "N/A"}`)
                    .join(", ")
                : "No Search Data"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LobbyTable;
