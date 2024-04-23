import { useState } from "react";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { loginWithCustomId } from "../PlayFab/PlayFabWrapper";

interface LoginUIProps {
  setPlayer: (player: PfLoginResult) => void;
}

const LoginUI: React.FC<LoginUIProps> = ({ setPlayer }) => {
  const [customIdInput, setCustomIdInput] = useState<string>("testuser");

  const handleCustomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomIdInput(event.target.value);
  };

  const handleLogin = () => {
    loginWithCustomId(customIdInput, (loginResult) => {
      setPlayer(loginResult);
    });
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
