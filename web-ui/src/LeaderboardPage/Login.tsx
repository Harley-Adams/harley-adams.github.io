import {
  CForm,
  CInputGroup,
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CButton,
} from "@coreui/react";
import PlayFabClient from "../PlayFab/PlayFabClient";
import PfLoginResult, {
  EntityTokenResponse,
} from "../PlayFab/models/PfLoginResult";

export interface LoginProps {
  titleId: string;
  loggedInCallback: (entityToken: EntityTokenResponse) => void;
}

function Login(props: LoginProps) {
  function onLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let newCustomId = formData.get("customIdInput");
    let newTitleId = formData.get("tilteIdInput");
    if (newCustomId !== null && newTitleId !== null) {
      let pfClient = new PlayFabClient(newTitleId.toString(), "", true);
      pfClient.LoginWithCustomId(
        newCustomId.toString(),
        (loginResult: PfLoginResult) => {
          props.loggedInCallback(loginResult.EntityToken);
        }
      );
    }
  }

  return (
    <div>
      <h2>Login to PlayFab</h2>
      <div className="loginForm">
        <CForm onSubmit={onLoginSubmit}>
          <CInputGroup className="mb-3">
            <CRow className="g-3">
              <CCol xs>
                <CFormLabel
                  htmlFor="customIdInput"
                  className="col-sm-2 col-form-label"
                >
                  CustomId
                </CFormLabel>
                <CFormInput
                  id="customIdInput"
                  placeholder="PlayFabCustomId"
                  aria-label="CustomID"
                  name="customIdInput"
                  defaultValue="CustomId"
                />
              </CCol>
              <CCol xs>
                <CFormLabel
                  htmlFor="titleIdInput"
                  className="col-sm-2 col-form-label"
                >
                  TitleId
                </CFormLabel>
                <CFormInput
                  id="tilteIdInput"
                  placeholder="PlayFabTitleId"
                  aria-label="TitleId"
                  name="tilteIdInput"
                  defaultValue={props.titleId}
                />
              </CCol>
              <CCol lg>
                <CButton
                  type="submit"
                  color="primary"
                  variant="outline"
                  id="button-addon2"
                >
                  Login
                </CButton>
              </CCol>
            </CRow>
          </CInputGroup>
        </CForm>
      </div>
    </div>
  );
}

export default Login;
