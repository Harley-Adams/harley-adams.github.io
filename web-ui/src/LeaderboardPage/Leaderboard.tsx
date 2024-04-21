import { useState } from "react";
import PlayFabWrapper from "../PlayFab/PlayFabWrapper";
import PfV2LeaderboardResult from "../PlayFab/models/PfV2LeaderboardResult";

import "@coreui/coreui/dist/css/coreui.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { EntityTokenResponse } from "../PlayFab/models/PfLoginResult";

import "./Leaderboard.css";
import Login from "./Login";
import LoginPrefilled from "./LoginPrefilled";
import GetTopNLeaderboard from "./GetTopNLeaderboard";
import GetLeaderboardAround from "./GetLeaderboardAround";
import GetLeaderboardForEntities from "./GetLeaderboardForEntities";

const statName = "ValidateCreateUpdateAndGetLeaderboardAsc";

function Leaderboard() {
  const [titleId, setTitleId] = useState<string>();
  const [useProd, setUseProd] = useState<boolean>();
  const [entityToken, setEntityToken] = useState<EntityTokenResponse>();
  const [topNData, setTopNData] = useState<PfV2LeaderboardResult>();
  const [aroundEntityData, setAroundEntityData] =
    useState<PfV2LeaderboardResult>();
  const [forEntityData, setForEntityData] = useState<PfV2LeaderboardResult>();

  function getTopN(): void {
    if (entityToken !== undefined && titleId !== undefined) {
      let pfClient = new PlayFabWrapper();
      pfClient.GetV2Leaderboard(entityToken, statName, setTopNData);
    }
  }

  // function getAround(): void {
  //   if (entityToken !== undefined && titleId !== undefined) {
  //     let pfClient = new PlayFabClient(titleId, "", useProd);
  //     pfClient.GetV2LeaderboardAroundPlayer(
  //       entityToken,
  //       statName,
  //       setAroundEntityData
  //     );
  //   }
  // }

  function getFor(): void {
    if (entityToken !== undefined && titleId !== undefined) {
      let entities = useProd
        ? ["", "", ""]
        : ["F2F1ED8411309928", "2BADD20E85FCE463", "C5395E00F9D9D73F"];
      let pfClient = new PlayFabWrapper();
      pfClient.GetV2LeaderboardForPlayers(
        entityToken,
        statName,
        entities,
        setForEntityData
      );
    }
  }

  function loggedInCallback(
    entityToken: EntityTokenResponse,
    titleId: string,
    useProd: boolean
  ) {
    setEntityToken(entityToken);
    setTitleId(titleId);
    setUseProd(useProd);
  }
  if (entityToken === undefined) {
    return (
      <div className="leaderboard">
        <h1>Leaderboards</h1>
        {/* <Login loggedInCallback={loggedInCallback} /> */}
        <LoginPrefilled loggedInCallback={loggedInCallback} />
      </div>
    );
  } else if (titleId !== undefined && useProd !== undefined) {
    return (
      <div className="leaderboard">
        <h1>Leaderboards</h1>

        <GetTopNLeaderboard
          entityToken={entityToken}
          titleId={titleId}
          statName={statName}
          useProd={useProd}
        />
        {/* <GetLeaderboardAround
          entityToken={entityToken}
          titleId={titleId}
          statName={statName}
          useProd={useProd}
        />
        <GetLeaderboardForEntities
          entityToken={entityToken}
          titleId={titleId}
          statName={statName}
          useProd={useProd}
        /> */}
      </div>
    );
  }
  return <div>Error: should not show</div>;
}

export default Leaderboard;
