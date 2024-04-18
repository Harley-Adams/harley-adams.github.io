import {
  CForm,
  CRow,
  CFormInput,
  CButton,
  CCol,
  CFormCheck,
  CContainer,
  CSpinner,
} from "@coreui/react";
import PlayFabWrapper from "../PlayFab/PlayFabWrapper";
import PfLoginResult, {
  EntityTokenResponse,
} from "../PlayFab/models/PfLoginResult";
import { useState } from "react";

export interface LoginProfilledProps {
  loggedInCallback: (
    entityToken: EntityTokenResponse,
    titleId: string,
    useProd: boolean
  ) => void;
}

function LoginPrefilled(props: LoginProfilledProps) {
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  function onLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setShowSpinner(true);

    let formData = new FormData(event.currentTarget);
    let newCustomId = formData.get("customIdInput");
    let prodRadio = formData.get("prodRadio");

    if (newCustomId !== null && prodRadio !== null) {
      let titleId: string = "";
      let isProd: boolean = true;

      if (prodRadio === "Production") {
        titleId = "A691C";
        isProd = true;
      } else if (prodRadio === "Not Production") {
        titleId = "F1098BBF";
        isProd = false;
      }

      let pfClient = new PlayFabWrapper(titleId, "", isProd);
      pfClient.LoginWithCustomId(
        newCustomId.toString(),
        (loginResult: PfLoginResult) => {
          props.loggedInCallback(loginResult.EntityToken, titleId, isProd);
        }
      );
    }
  }
  if (showSpinner) {
    return <CSpinner color="warning" variant="grow" />;
  } else {
    return (
      <div>
        <h2>Login to PlayFab</h2>
        <div className="loginForm">
          <CForm onSubmit={onLoginSubmit}>
            <CFormInput
              id="customIdInput"
              placeholder="PlayFabCustomId"
              aria-label="CustomID"
              name="customIdInput"
              defaultValue="1"
              floatingLabel="CustomId"
            />
            <CContainer fluid>
              <CRow xs={{ cols: 2, gutter: 2 }} lg={{ cols: 5, gutter: 3 }}>
                <CCol>
                  <CCol>
                    <CFormCheck
                      type="radio"
                      name="prodRadio"
                      id="flexRadioDefault1"
                      label="Production (A691C)"
                      value="Production"
                      defaultChecked
                    />
                    <CFormCheck
                      type="radio"
                      name="prodRadio"
                      id="flexRadioDefault2"
                      label="Not Production (F1098BBF)"
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
                </CCol>
              </CRow>
            </CContainer>
          </CForm>
        </div>
      </div>
    );
  }
}

export default LoginPrefilled;
