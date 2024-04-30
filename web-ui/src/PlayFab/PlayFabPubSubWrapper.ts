import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { PlayFabBaseAPI } from "../Constants";
import { EntityTokenResponse } from "./models/PfLoginResult";
import { PlayFabMultiplayerModels } from "./modules/PlayFabMultiplayerModule";

// This is here because for some reason it isn't generate in the node sdk.
interface PubSubNegotiateResponse {
  accessToken: string;
  url: string;
}

interface PubSubStartOrReconnectResponse {
  newConnectionHandle: string;
  status: string;
  traceId: string;
}

export interface PubSubMessage<LobbyDataType, PlayerDataType> {
  lobbyId: string;
  lobbyChanges: LobbyChanges<LobbyDataType, PlayerDataType>[];
}

export interface LobbyChanges<LobbyDataType, PlayerDataType> {
  changeNumber: number;
  pubSubConnectionHandle: string;
  memberToMerge: {
    memberEntity: {
      Type: string;
      Id: string;
    };
    pubSubConnectionHandle: string;
    memberData: PlayerDataType;
  };
  lobbyData: LobbyDataType;
}

export class PlayFabPubSub<LobbyDataType, PlayerDataType> {
  private connection: HubConnection | null = null;

  public PubSubSetupLobby = async (
    entityToken: EntityTokenResponse,
    lobbyId: string,
    connectedToLobbyCallback: (response: any) => void,
    messageReceivedCallback: (
      message: PubSubMessage<LobbyDataType, PlayerDataType>
    ) => void
  ) => {
    this.NegotiateToPubSub(entityToken, (result) => {
      this.ConnectToPubSub(
        result.url,
        result.accessToken,
        () => {
          this.StartOrRecoverSession((startResponse) => {
            this.SubscribeToLobby(
              entityToken,
              startResponse.newConnectionHandle,
              lobbyId,
              connectedToLobbyCallback
            );
          });
        },
        messageReceivedCallback
      );
    });
  };

  public NegotiateToPubSub = async (
    entityToken: EntityTokenResponse,
    callback: (createLobbyResult: PubSubNegotiateResponse) => void
  ) => {
    let apiEndpoint = PlayFabBaseAPI + "PubSub/Negotiate";

    fetch(apiEndpoint, {
      method: "POST",
      body: undefined,
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": `${entityToken.EntityToken}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        let rawResponse: PubSubNegotiateResponse = await response.json();
        callback(rawResponse);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab negotiate pubsub error: ${await response.text()}`);
      }
    });
  };

  public SubscribeToLobby = (
    entityToken: EntityTokenResponse,
    pubsubHandle: string,
    resourceId: string,
    callback: (
      subscribeToLobbyResult: PlayFabMultiplayerModels.SubscribeToLobbyResourceResult
    ) => void
  ) => {
    let apiEndpoint = PlayFabBaseAPI + `Lobby/SubscribeToLobbyResource`;
    const request: PlayFabMultiplayerModels.SubscribeToLobbyResourceRequest = {
      EntityKey: entityToken.Entity,
      PubSubConnectionHandle: pubsubHandle,
      ResourceId: resourceId,
      SubscriptionVersion: 1,
      Type: "LobbyChange",
    };

    fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": `${entityToken.EntityToken}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        callback(rawResponse.data);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab sub to lobby error: ${await response.text()}`);
      }
    });
  };

  public ConnectToPubSub(
    serverUrl: string,
    authToken: string,
    onConnectCallback: () => void,
    onReceiveMessageCallback: (
      message: PubSubMessage<LobbyDataType, PlayerDataType>
    ) => void
  ): void {
    // Create a new connection using the HubConnectionBuilder
    this.connection = new HubConnectionBuilder()
      .withUrl(serverUrl, {
        accessTokenFactory: () => authToken,
        headers: {
          "X-EntityToken": authToken,
        },
      })
      .withAutomaticReconnect()
      .withKeepAliveInterval(5000)
      .configureLogging(LogLevel.Information)
      .build();

    // Start the connection
    this.connection
      .start()
      .then(() => {
        console.log(`Connected to PlayFab PubSub!`);
        onConnectCallback();
      })
      .catch((err) =>
        console.error("Error while establishing connection :", err)
      );

    // Set up event handlers
    // Handle receiving messages
    this.connection.on("ReceiveMessage", (message: any) => {
      console.log(`Receive Message: ${message}`);

      // player data is any here because we haven't decoded it yet.
      const pubSubUpdate: PubSubMessage<LobbyDataType, any> = JSON.parse(
        atob(message.payload)
      );
      if (pubSubUpdate.lobbyChanges) {
        // Decode the member data
        pubSubUpdate.lobbyChanges.forEach((lobbyChange) => {
          if (lobbyChange.memberToMerge.memberData) {
            lobbyChange.memberToMerge.memberData = JSON.parse(
              atob(lobbyChange.memberToMerge.memberData.d)
            );
          }
        });
      }
      onReceiveMessageCallback(pubSubUpdate);
    });

    this.connection.on("ReceiveSubscriptionChangeMessage", (message: any) => {
      console.log("Receive Subscription Change Message: ", message);
    });

    // Handling reconnection manually if needed
    this.connection.onclose((error) => {
      console.log(`error: ${error}`);
      console.log("Disconnected. Trying to reconnect...");
      setTimeout(() => {
        this.connection
          ?.start()
          .then(() => {
            console.log("Reconnected!");
          })
          .catch((err) => console.error("Could not reconnect: ", err));
      }, 5000); // Retry after 5 seconds
    });
  }

  public StartOrRecoverSession(
    callback: (response: PubSubStartOrReconnectResponse) => void
  ): void {
    const traceId = generateTraceParent();
    console.log(`StartOrRecoverSession ${traceId}`);
    this.connection
      ?.invoke("StartOrRecoverSession", {
        traceId: traceId,
      })
      .then((response: PubSubStartOrReconnectResponse) => {
        console.log(`StartOrRecoverSession ${response.newConnectionHandle}`);
        callback(response);
      })
      .catch((err) => {
        console.error("Error while sending message: ", err);
      });
  }

  public UpdateLobby(
    entityToken: EntityTokenResponse,
    lobbyId: string,
    lobbyData?: LobbyDataType,
    playerData?: PlayerDataType
  ) {
    let apiEndpoint = PlayFabBaseAPI + `Lobby/UpdateLobby`;

    const encodedPlayerData = playerData
      ? btoa(JSON.stringify(playerData))
      : null;

    const request: PlayFabMultiplayerModels.UpdateLobbyRequest = {
      LobbyId: lobbyId,
      MemberEntity: entityToken.Entity,
    };

    if (playerData) {
      request.MemberData = { d: encodedPlayerData };
    }

    if (lobbyData) {
      request.LobbyData = lobbyData;
    }

    fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": `${entityToken.EntityToken}`,
      },
    }).then(async (response) => {
      if (!response.ok) {
        // tslint:disable-next-line: no-console
        console.log(`playfab lobby error: ${await response.text()}`);
      }
    });
  }
}
export default PlayFabPubSub;

function generateTraceParent(): string {
  // Helper function to generate random hex strings of a given length
  function randomHex(len: number): string {
    const maxByte = 256; // 2^8
    let result = "";
    for (let i = 0; i < len; i++) {
      result += Math.floor(Math.random() * maxByte)
        .toString(16)
        .padStart(2, "0");
    }
    return result;
  }

  const version = "00"; // Current version is 00
  const traceId = randomHex(16); // 16 bytes for traceId
  const parentId = randomHex(8); // 8 bytes for parentId
  const flags = "01"; // Example flags (e.g., sampled)

  return `${version}-${traceId}-${parentId}-${flags}`;
}
