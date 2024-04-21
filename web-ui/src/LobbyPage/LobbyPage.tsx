import { useState } from "react";
import PlayFabWrapper, { loginWithCustomId } from "../PlayFab/PlayFabWrapper";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { PlayFabMultiplayerModels } from "../PlayFab/PlayFabMultiplayerModule";
import LobbyTable from "./LobbyTable";
import { PlayFabPubSub } from "../PlayFab/PlayFabPubSub";
import GameFinder from "./GameFinder";

const LobbyPage: React.FC = () => {
  const pubsub: PlayFabPubSub = new PlayFabPubSub();
  return (
    <div>
      <GameFinder pubsub={pubsub} />
    </div>
  );
};

export default LobbyPage;
