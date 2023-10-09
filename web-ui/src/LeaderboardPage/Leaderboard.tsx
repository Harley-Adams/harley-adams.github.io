import { useState } from "react";
import PlayFabClient from "../PlayFab/PlayFabClient";
import PfV2LeaderboardResult from "../PlayFab/models/PfV2LeaderboardResult";
import LeaderboardTable from "./LeaderboardTable";
import { CButton } from "@coreui/react";

import "@coreui/coreui/dist/css/coreui.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { EntityTokenResponse } from "../PlayFab/models/PfLoginResult";

import "./Leaderboard.css";
import Login from "./Login";

const statName = "HarleyStat";
// Prod
const titleId = "A691C";
// Match
// const titleId = "F1098BBF";
const useProd: boolean = true;

function Leaderboard() {
  const [entityToken, setEntityToken] = useState<EntityTokenResponse>();
  const [topNData, setTopNData] = useState<PfV2LeaderboardResult>();
  const [aroundEntityData, setAroundEntityData] =
    useState<PfV2LeaderboardResult>();

  function getTopN(): void {
    if (entityToken !== undefined) {
      let pfClient = new PlayFabClient(titleId, "", useProd);
      pfClient.GetV2Leaderboard(entityToken.EntityToken, statName, setTopNData);
    }
  }

  function getAround(): void {
    if (entityToken !== undefined) {
      let pfClient = new PlayFabClient(titleId, "", useProd);
      pfClient.GetV2LeaderboardAroundPlayer(
        entityToken.EntityToken,
        statName,
        "C", // This is wrong
        setAroundEntityData
      );
    }
  }

  function loggedInCallback(entityToken: EntityTokenResponse) {
    setEntityToken(entityToken);
  }

  return (
    <div className="leaderboard">
      <h1>Leaderboards</h1>
      {entityToken === undefined ? (
        <div>
          <Login titleId={titleId} loggedInCallback={loggedInCallback} />
        </div>
      ) : (
        <div></div>
      )}

      <h2>GetTopNLeaderboard</h2>
      <CButton
        type="submit"
        color="primary"
        variant="outline"
        id="button-addon2"
        onClick={getTopN}
      >
        GetLeaderboards
      </CButton>
      {topNData !== undefined ? (
        <LeaderboardTable rankings={topNData?.Rankings} />
      ) : (
        <div>
          Note: I don't cache the auth token, so this demo may fail due to rate
          limit rules
        </div>
      )}

      <h2>GetLeaderboardAroundEntity</h2>
      <CButton
        type="submit"
        color="primary"
        variant="outline"
        id="button-addon2"
        onClick={getAround}
      >
        GetLeaderboardAroundEntity
      </CButton>
      {aroundEntityData !== undefined ? (
        <LeaderboardTable rankings={aroundEntityData?.Rankings} />
      ) : (
        <div />
      )}
    </div>
  );
}

export default Leaderboard;
