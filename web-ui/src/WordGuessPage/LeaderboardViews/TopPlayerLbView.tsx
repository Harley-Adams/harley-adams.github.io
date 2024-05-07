import { useEffect, useState } from "react";
import { GetLeaderboard } from "../../PlayFab/PlayFabWrapper";
import PfLoginResult from "../../PlayFab/models/PfLoginResult";
import {
  EntityLeaderboardEntry,
  GetEntityLeaderboardResponse,
} from "../../PlayFab/modules/PlayFabLeaderboardsModule";
import {
  LeaderboardViewProps,
  TransformMsStringToSeconds,
} from "./LeaderboardView";
import { useRecoilState } from "recoil";
import { loggedInPlayerState } from "../WordleState";

const TopPlayerLbView: React.FC<LeaderboardViewProps> = ({
  leaderboardName,
  version,
}) => {
  const [leaderboardResult, setLeaderboardResult] =
    useState<GetEntityLeaderboardResponse | null>(null);

  const [player] = useRecoilState(loggedInPlayerState);

  useEffect(() => {
    if (!player) {
      return;
    }

    GetLeaderboard(player.EntityToken, leaderboardName, version).then(
      (data) => {
        setLeaderboardResult(data);
      }
    );
  }, [leaderboardName, version]);

  if (!leaderboardResult) {
    return <div>Loading...</div>;
  }

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
    {
      key: "col_1",
      label: "Puzzles Solved",
      _props: { scope: "col" },
    },
    {
      key: "col_2",
      label: "Guesses Made",
      _props: { scope: "col" },
    },
    {
      key: "col_3",
      label: "Time Taken (seconds)",
      _props: { scope: "col" },
    },
    {
      key: "col_4",
      label: "Wrong Letters Guessed",
      _props: { scope: "col" },
    },
    {
      key: "col_5",
      label: "Misplaced Letters Guessed",
      _props: { scope: "col" },
    },
  ];

  let projectedDataItems = leaderboardResult.Rankings.map(
    (item: EntityLeaderboardEntry) => ({
      rank: item.Rank,
      entityId: item.DisplayName ? item.DisplayName : item.Entity.Id,
      col_1: item.Scores[0] ? item.Scores[0] : "",
      col_2: item.Scores[1] ? item.Scores[1] : "",
      col_3: item.Scores[2] ? TransformMsStringToSeconds(item.Scores[2]) : "",
      col_4: item.Scores[3] ? item.Scores[3] : "",
      col_5: item.Scores[4] ? item.Scores[4] : "",
      _cellProps: { id: { scope: "row" } },
    })
  );

  return (
    <div>
      <div>
        {/* <CTable columns={columns} items={projectedDataItems} striped={true} /> */}
      </div>
    </div>
  );
};

export default TopPlayerLbView;
