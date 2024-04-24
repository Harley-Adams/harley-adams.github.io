import { useEffect, useState } from "react";
import { GetLeaderboard } from "../PlayFab/PlayFabWrapper";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { GetEntityLeaderboardResponse } from "../PlayFab/PlayFabLeaderboards";

interface LeaderboardViewProps {
  player: PfLoginResult;
  leaderboardName: string;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  player,
  leaderboardName,
}) => {
  const [leaderboardResult, setLeaderboardResult] =
    useState<GetEntityLeaderboardResponse | null>(null);

  useEffect(() => {
    GetLeaderboard(player.EntityToken, leaderboardName, setLeaderboardResult);
  }, []);

  if (!leaderboardResult) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Entity ID</th>
            <th>Scores</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardResult?.Rankings.map((entry, index) => (
            <tr key={index}>
              <td>{entry.Rank}</td>
              <td>{entry.Entity.Id}</td>
              <td>{entry.Scores.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardView;
