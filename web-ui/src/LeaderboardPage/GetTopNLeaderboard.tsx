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

function GetTopNLeaderboard(props: Props) {
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [lbData, setLbData] = useState<PfV2LeaderboardResult>();

  function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setShowSpinner(true);

    let pfClient = new PlayFabClient(props.titleId, "", props.useProd);
    pfClient.GetV2Leaderboard(
      props.entityToken,
      props.statName,
      (leaderboardResult: PfV2LeaderboardResult) => {
        setShowSpinner(false);
        setLbData(leaderboardResult);
      }
    );
  }

  if (showSpinner) {
    return (
      <div>
        <h2>GetTopNLeaderboard</h2>
        <CSpinner color="warning" variant="grow" />
      </div>
    );
  } else {
    return (
      <div>
        <h2>GetTopNLeaderboard</h2>
        <CForm onSubmit={onSubmit}>
          <CButton
            type="submit"
            color="primary"
            variant="outline"
            id="button-addon2"
          >
            GetLeaderboard
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

export default GetTopNLeaderboard;
