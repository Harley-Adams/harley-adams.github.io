import { CButton, CForm, CFormInput, CSpinner } from "@coreui/react";
import { EntityTokenResponse } from "../PlayFab/models/PfLoginResult";
import PfV2LeaderboardResult from "../PlayFab/models/PfV2LeaderboardResult";
import { useState } from "react";
import LeaderboardTable from "./LeaderboardTable";
import PlayFabWrapper from "../PlayFab/PlayFabWrapper";

interface Props {
  entityToken: EntityTokenResponse;
  titleId: string;
  statName: string;
  useProd: boolean;
}

function GetLeaderboardAround(props: Props) {
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [lbData, setLbData] = useState<PfV2LeaderboardResult>();

  function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setShowSpinner(true);

    let formData = new FormData(event.currentTarget);
    let centerEntityId = formData.get("centerEntityId")?.toString();

    if (centerEntityId !== undefined) {
      let pfClient = new PlayFabWrapper(props.titleId, "", props.useProd);
      pfClient.GetV2LeaderboardAroundPlayer(
        props.entityToken,
        props.statName,
        centerEntityId,
        (leaderboardResult: PfV2LeaderboardResult) => {
          setShowSpinner(false);
          setLbData(leaderboardResult);
        }
      );
    }
  }
  if (showSpinner) {
    return (
      <div>
        <h2>GetLeaderboardAroundPlayer</h2>
        <CSpinner color="warning" variant="grow" />
      </div>
    );
  } else {
    return (
      <div>
        <h2>GetLeaderboardAroundPlayer</h2>
        <CForm onSubmit={onSubmit}>
          <CFormInput
            id="centerEntityId"
            placeholder="PlayFabCustomId"
            aria-label="CenterEntityId"
            name="centerEntityId"
            defaultValue={props.entityToken.Entity.Id}
            floatingLabel="CustomId"
          />
          <CButton
            type="submit"
            color="primary"
            variant="outline"
            id="button-addon2"
          >
            GetLeaderboardAroundPlayer
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

export default GetLeaderboardAround;
