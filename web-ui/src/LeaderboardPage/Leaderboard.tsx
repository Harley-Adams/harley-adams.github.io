import { useState, useEffect } from "react";
import PlayFabClient from "../PlayFab/PlayFabClient";
import PfV2LeaderboardResult from "../PlayFab/models/PfV2LeaderboardResult";
import {
  GetLeaderboardAroundEntity,
  GetTopNLeaderboard,
} from "./LeaderboardFetcher";
import LeaderboardTable from "./LeaderboardTable";

const statName = "HarleyStat";
// Prod
const titleId = "A691C";
// Match
// const titleId = "F1098BBF";
const useProd: boolean = true;

function Leaderboard() {
  const [topNData, setTopNData] = useState<PfV2LeaderboardResult>();
  const [aroundEntityData, setAroundEntityData] =
    useState<PfV2LeaderboardResult>();

  useEffect(() => {
    let pfClient = new PlayFabClient(titleId, "", useProd);
    GetTopNLeaderboard(pfClient, statName, setTopNData);
  }, []);

  useEffect(() => {
    let pfClient = new PlayFabClient(titleId, "", useProd);
    GetLeaderboardAroundEntity(pfClient, statName, setTopNData);
  }, []);

  return (
    <div>
      <h1>Leaderboards</h1>
      <h2>GetTopNLeaderboard</h2>
      {topNData !== undefined ? (
        <LeaderboardTable rankings={topNData?.Rankings} />
      ) : (
        <div />
      )}
      <h2>GetLeaderboardAroundEntity</h2>
      {topNData !== undefined ? (
        <LeaderboardTable rankings={topNData?.Rankings} />
      ) : (
        <div />
      )}
    </div>
  );
}

export default Leaderboard;
