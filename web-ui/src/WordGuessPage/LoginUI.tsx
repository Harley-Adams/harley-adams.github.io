import { useState } from "react";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { loginWithCustomId } from "../PlayFab/PlayFabWrapper";

interface LoginUIProps {
  setPlayer: (player: PfLoginResult) => void;
  setCustomId: (customId: string) => void;
}

const LoginUI: React.FC<LoginUIProps> = ({ setPlayer, setCustomId }) => {
  const [customIdInput, setCustomIdInput] = useState<string>("testuser");

  const handleCustomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomIdInput(event.target.value);
  };

  const handleLogin = async () => {
    const loginResponse = await loginWithCustomId(customIdInput);
    if (loginResponse) {
      setPlayer(loginResponse);
      setCustomId(customIdInput);
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
