import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from "@microsoft/signalr";
import { PlayFabBaseAPI } from "../Constants";
import { EntityTokenResponse } from "./models/PfLoginResult";

// This is here because for some reason it isn't generate in the node sdk.
export interface PubSubNegotiateResponse {
  accessToken: string;
  url: string;
}

export interface PubSubStartOrReconnectResponse {
  newConnectionHandle: string;
  status: string;
  traceId: string;
}

export class PlayFabPubSub {
  private connection: HubConnection | null = null;

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

  public ConnectToPubSub(
    serverUrl: string,
    authToken: string,
    onConnectCallback: () => void,
    onReceiveMessageCallback: (message: any) => void
  ): void {
    // Create a new connection using the HubConnectionBuilder
    this.connection = new HubConnectionBuilder()
      .withUrl(serverUrl, {
        accessTokenFactory: () => authToken,
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
        headers: {
          "X-EntityToken": authToken,
        },
      })
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
      onReceiveMessageCallback(message);
    });

    this.connection.on("ReceiveSubscriptionChangeMessage", (message: any) => {
      console.log("Receive Subscription Change Message: ", message);
    });

    // Handling reconnection manually if needed
    this.connection.onclose(() => {
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
    this.connection
      ?.invoke("StartOrRecoverSession", {
        traceId: "00-84678fd69ae13e41fce1333289bcf482-22d157fb94ea4827-01",
      })
      .then((response: PubSubStartOrReconnectResponse) => {
        console.log(`StartOrRecoverSession ${response.newConnectionHandle}`);
        callback(response);
      })
      .catch((err) => {
        console.error("Error while sending message: ", err);
      });
  }
}
export default PlayFabPubSub;
