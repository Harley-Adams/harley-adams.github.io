import { useState } from "react";
import PfLoginResult from "../../PlayFab/models/PfLoginResult";
import { loginWithCustomId } from "../../PlayFab/PlayFabWrapper";
import { useRecoilState } from "recoil";
import { customIdState, loggedInPlayerState } from "../WordleState";

const LoginUI: React.FC = () => {
  const [loggedInPlayer, setLoggedInPlayer] =
    useRecoilState(loggedInPlayerState);
  const [customIdInput, setCustomIdInput] = useRecoilState(customIdState);

  const handleCustomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomIdInput(event.target.value);
  };

  const handleLogin = async () => {
    const loginResponse = await loginWithCustomId(customIdInput);
    if (loginResponse) {
      setLoggedInPlayer(loginResponse);
    }
  };

  return (
    <div className="login-container">
      <h2>Login to PlayFab</h2>
      Provide any custom id:
      <input
        type="text"
        defaultValue={customIdInput}
        onChange={handleCustomIdChange}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginUI;
