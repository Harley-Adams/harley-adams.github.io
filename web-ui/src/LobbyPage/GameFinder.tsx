import { useEffect, useState } from "react";
import PlayFabWrapper, { loginWithCustomId } from "../PlayFab/PlayFabWrapper";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import { PlayFabMultiplayerModels } from "../PlayFab/PlayFabMultiplayerModule";
import LobbyTable from "./LobbyTable";
import { PlayFabPubSub, PubSubMessage } from "../PlayFab/PlayFabPubSub";
import {
  GameState,
  WordleGameDataContract,
  WordlePlayerContract,
} from "../WordGuessPage/WordleContract";
import WordGuessGame from "../WordGuessPage/WordGuessGame";
import React from "react";
import LoginUI from "../WordGuessPage/LoginUI";

const GameFinder: React.FC = () => {
  const pubsub: PlayFabPubSub<WordleGameDataContract, WordlePlayerContract> =
    new PlayFabPubSub();
  const [player, setPlayer] = useState<PfLoginResult>();
  const [lobbies, setLobbies] =
    useState<PlayFabMultiplayerModels.FindLobbiesResult>();
  const [showLobbyTable, setShowLobbyTable] = useState<boolean>(false);
  const [isInLobby, setIsInLobby] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [currentLobbyId, setCurrentLobbyId] = useState<string>("");
  const [otherPlayers, setOtherPlayers] = useState<
    Map<string, WordlePlayerContract>
  >(new Map());
  const otherPlayersRef = React.useRef(otherPlayers);

  useEffect(() => {
    // Ensure the ref is always at the latest value
    otherPlayersRef.current = otherPlayers;
  }, [otherPlayers]);

  let pfClient = new PlayFabWrapper();

  const handleJoinLobby = (connectionString: string) => {
    if (!player) {
      return;
    }

    pfClient.JoinLobby(player?.EntityToken, connectionString, (joinResult) => {
      setCurrentLobbyId(joinResult.LobbyId);
      pubsub.PubSubSetupLobby(
        player.EntityToken,
        joinResult.LobbyId,
        (response) => {
          setIsInLobby(true);
        },
        (message) => {
          handleGameUpdate(message);
        }
      );
    });
  };

  const handleCreateLobbyAndSub = () => {
    if (player == null) {
      console.error("Player must be logged in to create a lobby");
      return;
    }

    const memberData: PlayFabMultiplayerModels.Member[] = [
      { MemberEntity: player.EntityToken.Entity },
    ];

    pfClient.CreateLobby(
      player.EntityToken,
      true,
      { gameState: GameState.preGame },
      memberData,
      (createLobbyResult) => {
        setCurrentLobbyId(createLobbyResult.LobbyId);
        setIsHost(true);
        pubsub.PubSubSetupLobby(
          player.EntityToken,
          createLobbyResult.LobbyId,
          (response) => {
            setIsInLobby(true);
          },
          (message) => {
            console.log(`Received message: ${JSON.stringify(message)}`);
            handleGameUpdate(message);
          }
        );
      }
    );
  };

  const handleGameUpdate = (
    update: PubSubMessage<WordleGameDataContract, WordlePlayerContract>
  ) => {
    // First update doesn't seem to have prefilled lobby data.
    // Not sure why, but assume that if it's missing do nothing.
    if (update.lobbyChanges[0].lobbyData) {
      if (update.lobbyChanges[0].lobbyData.gameState == GameState.inGame) {
        setIsGameStarted(true);
      }
    }

    console.log(`num lobby changes: ${update.lobbyChanges.length}`);
    console.log(`Game update: ${JSON.stringify(update)}`);
    update.lobbyChanges.forEach((change) => {
      if (change.memberToMerge.memberData) {
        // if (
        //   update.lobbyChanges[0].memberToMerge.memberEntity.Id ===
        //   player?.EntityToken.Entity.Id
        // ) {
        //   console.log("Skipping self update!");
        //   continue;
        // }
        const memberToMerge = change.memberToMerge;

        otherPlayers.set(
          memberToMerge.memberEntity.Id,
          memberToMerge.memberData
        );

        // spread out, react does a shallow compare so
        // we need to create a new object for new state to be detected
        const newOtherPlayers: Map<string, WordlePlayerContract> = new Map();

        for (let [key, value] of otherPlayersRef.current) {
          newOtherPlayers.set(key, value);
        }

        newOtherPlayers.set(
          memberToMerge.memberEntity.Id,
          memberToMerge.memberData
        );

        setOtherPlayers(newOtherPlayers);
      }
    });

    // if (update.lobbyChanges[0].memberToMerge.memberData) {
    //   // if (
    //   //   update.lobbyChanges[0].memberToMerge.memberEntity.Id ===
    //   //   player?.EntityToken.Entity.Id
    //   // ) {
    //   //   console.log("Skipping self update!");
    //   // }
    //   const memberToMerge = update.lobbyChanges[0].memberToMerge;
    //   otherPlayers.set(memberToMerge.memberEntity.Id, memberToMerge.memberData);
    //   setOtherPlayers(otherPlayers);
    // }
  };

  const handleStartGame = () => {
    if (player) {
      pubsub.UpdateLobby(
        player.EntityToken,
        currentLobbyId,
        (updateResult) => {},
        {
          gameState: GameState.inGame,
          word: "Grace",
          startTime: Date.now(),
        }
      );
    }
  };

  const handleFindLobbies = () => {
    if (player != null) {
      pfClient.GetLobbies(player.EntityToken, (lobbies) => {
        setLobbies(lobbies);
        setShowLobbyTable(true);
      });
    }
  };

  const handlePlayerUpdate = (update: WordlePlayerContract) => {
    if (!player) {
      return;
    }

    pubsub.UpdateLobby(
      player?.EntityToken,
      currentLobbyId,
      (updateResult) => {},
      undefined,
      update
    );
  };

  const handleLocalGameUpdate = (update: WordleGameDataContract) => {};
  const handleGameComplete = () => {
    setIsGameStarted(false);
  };

  if (!player) {
    return (
      <div>
        <LoginUI setPlayer={setPlayer} />
      </div>
    );
  }

  if (isGameStarted) {
    return (
      <div>
        You are player: {player?.EntityToken.Entity.Id}
        <WordGuessGame
          word="Grace"
          gameCompleteCallback={() => {
            handleGameComplete();
          }}
          gameUpdateCallback={handleLocalGameUpdate}
          playerUpdateCallback={handlePlayerUpdate}
          otherPlayers={otherPlayers}
        />
      </div>
    );
  }

  return (
    <div>
      <h1>Lobby Page</h1>
      <br />
      <div className="lobbyButtons">
        <button onClick={handleFindLobbies}>Find lobbies</button>
        <button onClick={handleCreateLobbyAndSub}>Create New Lobby</button>
      </div>
      {showLobbyTable ? (
        <LobbyTable
          player={player}
          lobbies={lobbies?.Lobbies || []}
          onJoinLobby={handleJoinLobby}
        />
      ) : null}
      {isHost ? <button onClick={handleStartGame}>StartGame</button> : null}
      {isGameStarted ? <h1>Game Started</h1> : null}
      {/* {isInLobby ? <CurrentLobbyView /> : null} */}
    </div>
  );
};

export default GameFinder;

const CurrentLobbyView: React.FC = () => {
  return <div></div>;
};
