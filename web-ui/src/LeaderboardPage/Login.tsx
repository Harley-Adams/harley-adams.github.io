import {
  CForm,
  CInputGroup,
  CRow,
  CFormInput,
  CButton,
  CCol,
  CFormCheck,
  CContainer,
} from "@coreui/react";
import PlayFabWrapper from "../PlayFab/PlayFabWrapper";
import PfLoginResult, {
  EntityTokenResponse,
} from "../PlayFab/models/PfLoginResult";

export interface LoginProps {
  loggedInCallback: (
    entityToken: EntityTokenResponse,
    titleId: string,
    useProd: boolean
  ) => void;
}

function Login(props: LoginProps) {
  function onLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let newCustomId = formData.get("customIdInput");
    let newTitleId = formData.get("tilteIdInput");
    let prodRadio = formData.get("prodRadio");

    if (newCustomId !== null && newTitleId !== null && prodRadio !== null) {
      let titleId = newTitleId.toString();
      let isProd = prodRadio === "Production";

      let pfClient = new PlayFabWrapper(titleId, "", isProd);

      pfClient.LoginWithCustomId(
        newCustomId.toString(),
        (loginResult: PfLoginResult) => {
          props.loggedInCallback(
            loginResult.EntityToken,
            titleId,
            prodRadio === "Production"
          );
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
            <CContainer fluid>
              <CRow xs={{ cols: 2, gutter: 2 }} lg={{ cols: 5, gutter: 3 }}>
                <CFormInput
                  id="customIdInput"
                  placeholder="PlayFabCustomId"
                  aria-label="CustomID"
                  name="customIdInput"
                  defaultValue="CustomId"
                  floatingLabel="CustomId"
                />
                <CFormInput
                  id="tilteIdInput"
                  placeholder="PlayFabTitleId"
                  aria-label="TitleId"
                  name="tilteIdInput"
                  defaultValue="A691C"
                  floatingLabel="TitleId"
                />
                <CCol>
                  <CFormCheck
                    type="radio"
                    name="prodRadio"
                    id="flexRadioDefault1"
                    label="Production"
                    value="Production"
                    defaultChecked
                  />
                  <CFormCheck
                    type="radio"
                    name="prodRadio"
                    id="flexRadioDefault2"
                    label="Not Production"
                    value="Not Production"
                  />
                </CCol>
                <CButton
                  type="submit"
                  color="primary"
                  variant="outline"
                  id="button-addon2"
                >
                  Login
                </CButton>
              </CRow>
            </CContainer>
          </CInputGroup>
        </CForm>
      </div>
    </div>
  );
}

export default Login;
