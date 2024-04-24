import { useEffect, useState } from "react";
import { GetLeaderboard, GetStatistics } from "../PlayFab/PlayFabWrapper";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import {
  GetEntityLeaderboardResponse,
  GetStatisticsResponse,
} from "../PlayFab/PlayFabLeaderboards";

interface StatisticsViewProps {
  player: PfLoginResult;
}

const StatisticsView: React.FC<StatisticsViewProps> = ({ player }) => {
  const [statisticsResult, setStatisticsResult] =
    useState<GetStatisticsResponse | null>(null);

  useEffect(() => {
    GetStatistics(player.EntityToken, setStatisticsResult);
  }, []);

  if (!statisticsResult) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Statistic Name</th>
            <th>Version</th>
            <th>Scores</th>
          </tr>
        </thead>
        <tbody>
          {statisticsResult?.Statistics.map((entry, index) => (
            <tr key={index}>
              <td>{entry.name}</td>
              <td>{entry.version}</td>
              <td>{entry.Scores.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatisticsView;
