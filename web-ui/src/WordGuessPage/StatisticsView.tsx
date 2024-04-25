import { useEffect, useState } from "react";
import { GetStatistics } from "../PlayFab/PlayFabWrapper";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { GetStatisticsResponse } from "../PlayFab/PlayFabLeaderboards";
import { CTable } from "@coreui/react";
import { version } from "os";

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

  const columns = [
    {
      key: "statName",
      label: "statName",
      _props: { scope: "col" },
    },
    {
      key: "version",
      _props: { scope: "col" },
    },
    {
      key: "col_1",
      label: "Score1",
      _props: { scope: "col" },
    },
    {
      key: "col_2",
      label: "Score2",
      _props: { scope: "col" },
    },
    {
      key: "col_3",
      label: "Score3",
      _props: { scope: "col" },
    },
    {
      key: "col_4",
      label: "Score4",
      _props: { scope: "col" },
    },
    {
      key: "col_5",
      label: "Score5",
      _props: { scope: "col" },
    },
    {
      key: "metadata",
      label: "Metadata",
      _props: { scope: "col" },
    },
  ];

  console.log(`${JSON.stringify(statisticsResult.Statistics)}`);
  let projectedDataItems = Object.entries(statisticsResult.Statistics).map(
    ([statName, stat]) => ({
      statName: statName,
      version: stat.Version ? stat.Version : "0",
      col_1: stat.Scores[0] ? stat.Scores[0] : "",
      col_2: stat.Scores[1] ? stat.Scores[1] : "",
      col_3: stat.Scores[2] ? stat.Scores[2] : "",
      col_4: stat.Scores[3] ? stat.Scores[3] : "",
      col_5: stat.Scores[4] ? stat.Scores[4] : "",
      metadata: stat.Metadata ? stat.Metadata : "",
      _cellProps: { id: { scope: "row" } },
    })
  );

  return (
    <div>
      <CTable columns={columns} items={projectedDataItems} striped={true} />
    </div>
  );
};

export default StatisticsView;
