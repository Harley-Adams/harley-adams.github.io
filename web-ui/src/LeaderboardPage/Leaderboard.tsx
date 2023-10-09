import { useState } from "react";
import PlayFabClient from "../PlayFab/PlayFabClient";
import PfV2LeaderboardResult from "../PlayFab/models/PfV2LeaderboardResult";
import LeaderboardTable from "./LeaderboardTable";
import {
  CInputGroup,
  CFormInput,
  CButton,
  CForm,
  CFormLabel,
  CRow,
  CCol,
} from "@coreui/react";

import "@coreui/coreui/dist/css/coreui.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import PfLoginResult, {
  EntityTokenResponse,
} from "../PlayFab/models/PfLoginResult";

const statName = "HarleyStat";
// Prod
const titleId = "A691C";
// Match
// const titleId = "F1098BBF";
const useProd: boolean = true;

function Leaderboard() {
  const [customId, setCustomId] = useState<string>();
  const [entityToken, setEntityToken] = useState<EntityTokenResponse>();
  const [topNData, setTopNData] = useState<PfV2LeaderboardResult>();
  const [aroundEntityData, setAroundEntityData] =
    useState<PfV2LeaderboardResult>();

  function onLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let newCustomId = formData.get("customIdInput");
    let newTitleId = formData.get("tilteIdInput");
    if (newCustomId !== null && newTitleId !== null) {
      setCustomId(newCustomId.toString());

      let pfClient = new PlayFabClient(newTitleId.toString(), "", useProd);
      pfClient.LoginWithCustomId(
        newCustomId.toString(),
        (loginResult: PfLoginResult) => {
          setEntityToken(loginResult.EntityToken);
        }
      );
    }
  }

  function getTopN(): void {
    if (entityToken !== undefined) {
      let pfClient = new PlayFabClient(titleId, "", useProd);
      pfClient.GetV2Leaderboard(entityToken.EntityToken, statName, setTopNData);
      // GetTopNLeaderboard(pfClient, statName, customId, setTopNData);
    }
  }

  function getAround(): void {
    if (entityToken !== undefined && customId !== undefined) {
      let pfClient = new PlayFabClient(titleId, "", useProd);
      pfClient.GetV2LeaderboardAroundPlayer(
        entityToken.EntityToken,
        statName,
        customId, // This is wrong
        setAroundEntityData
      );
    }
  }

  return (
    <div>
      <h1>Leaderboards</h1>
      {customId === undefined ? (
        <div>
          <h2>Login to PlayFab</h2>
          <CForm onSubmit={onLoginSubmit}>
            <CInputGroup className="mb-3">
              <CRow className="mb-3">
                {/* <CFormLabel
                  htmlFor="customIdInput"
                  className="col-sm-2 col-form-label"
                >
                  CustomId
                </CFormLabel> */}
                <CCol>
                  <CFormInput
                    id="customIdInput"
                    label="CustomId"
                    placeholder="PlayFabCustomId"
                    aria-label="CustomID"
                    name="customIdInput"
                    defaultValue={"CustomId"}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel
                  htmlFor="tilteIdInput"
                  className="col-sm-2 col-form-label"
                >
                  TitleId
                </CFormLabel>
                <CCol>
                  <CFormInput
                    id="tilteIdInput"
                    placeholder="PlayFabTitleId"
                    aria-label="TitleId"
                    name="tilteIdInput"
                    defaultValue={titleId}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CButton
                  type="submit"
                  color="primary"
                  variant="outline"
                  id="button-addon2"
                >
                  Login
                </CButton>
              </CRow>
            </CInputGroup>
          </CForm>
        </div>
      ) : (
        <div />
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
