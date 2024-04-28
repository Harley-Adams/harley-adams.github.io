import { useEffect, useState } from "react";
import { GetLeaderboard } from "../../PlayFab/PlayFabWrapper";
import PfLoginResult from "../../PlayFab/models/PfLoginResult";
import {
  EntityLeaderboardEntry,
  GetEntityLeaderboardResponse,
} from "../../PlayFab/modules/PlayFabLeaderboardsModule";
import { CTable } from "@coreui/react";

export interface LeaderboardViewProps {
  player: PfLoginResult;
  leaderboardName: string;
  version?: number;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  player,
  leaderboardName,
  version,
}) => {
  const [leaderboardResult, setLeaderboardResult] =
    useState<GetEntityLeaderboardResponse | null>(null);

  useEffect(() => {
    GetLeaderboard(player.EntityToken, leaderboardName, version).then(
      (data) => {
        setLeaderboardResult(data);
      }
    );
  }, [leaderboardName, version]);

  if (!leaderboardResult) {
    return <div>Loading...</div>;
  }
  const scoreColumns = leaderboardResult.Rankings[0].Scores.map((d, index) => {
    return {
      key: `col_${index}`,
      label: `Score${index}`,
      _props: { scope: "col" },
    };
  });

  const columns = [
    {
      key: "rank",
      label: "Rank",
      _props: { scope: "col" },
    },
    {
      key: "entityId",
      _props: { scope: "col" },
    },
    ...scoreColumns,
    {
      key: "metadata",
      label: "Metadata",
      _props: { scope: "col" },
    },
  ];

  let projectedDataItems = leaderboardResult.Rankings.map(
    (item: EntityLeaderboardEntry) => ({
      rank: item.Rank,
      entityId: item.DisplayName ? item.DisplayName : item.Entity.Id,
      col_0: item.Scores[0] ? item.Scores[0] : "",
      col_1: item.Scores[1] ? item.Scores[1] : "",
      col_2: item.Scores[2] ? item.Scores[2] : "",
      col_3: item.Scores[3] ? item.Scores[3] : "",
      col_4: item.Scores[4] ? item.Scores[4] : "",
      metadata: item.Metadata ? item.Metadata : "",
      _cellProps: { id: { scope: "row" } },
    })
  );

  return (
    <div>
      <div>
        <CTable columns={columns} items={projectedDataItems} striped={true} />
      </div>
    </div>
  );
};

export default LeaderboardView;

export function TransformMsStringToSeconds(msString: string): string {
  const ms: number = parseInt(msString);
  return (ms / 1000).toFixed(2);
}
