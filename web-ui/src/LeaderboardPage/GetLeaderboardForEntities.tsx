import { CButton, CForm, CSpinner } from "@coreui/react";
import { EntityTokenResponse } from "../PlayFab/models/PfLoginResult";
import PfV2LeaderboardResult from "../PlayFab/models/PfV2LeaderboardResult";
import { useState } from "react";
import LeaderboardTable from "./LeaderboardTable";
import PlayFabClient from "../PlayFab/PlayFabClient";

interface Props {
  entityToken: EntityTokenResponse;
  titleId: string;
  statName: string;
  useProd: boolean;
}

function GetLeaderboardForEntities(props: Props) {
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [lbData, setLbData] = useState<PfV2LeaderboardResult>();

  function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setShowSpinner(true);

    let pfClient = new PlayFabClient(props.titleId, "", props.useProd);
    pfClient.GetV2LeaderboardForPlayers(
      props.entityToken,
      props.statName,
      [props.entityToken.Entity.Id],
      (leaderboardResult: PfV2LeaderboardResult) => {
        setShowSpinner(false);
        setLbData(leaderboardResult);
      }
    );
  }

  if (showSpinner) {
    return (
      <div>
        <h2>GetLeaderboardForEntities</h2>
        <CSpinner color="warning" variant="grow" />
      </div>
    );
  } else {
    return (
      <div>
        <h2>GetLeaderboardForEntities</h2>
        <CForm onSubmit={onSubmit}>
          <CButton
            type="submit"
            color="primary"
            variant="outline"
            id="button-addon2"
          >
            Get Leaderboard for Players
          </CButton>
        </CForm>
        {lbData !== undefined ? (
          <LeaderboardTable rankings={lbData?.Rankings} />
        ) : (
          <div />
        )}
      </div>
    );
  }
}

export default GetLeaderboardForEntities;
