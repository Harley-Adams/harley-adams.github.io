import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from "@microsoft/signalr";

class PlayFabPubSub {
  private connection: HubConnection | undefined;

  constructor(private serverUrl: string, private authToken: string) {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    // Create a new connection using the HubConnectionBuilder
    this.connection = new HubConnectionBuilder()
      .withUrl(this.serverUrl, {
        accessTokenFactory: () => this.authToken,
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
        headers: {
          "X-EntityToken": this.authToken,
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Start the connection
    this.connection
      .start()
      .then(() => console.log("Connected to PlayFab PubSub!"))
      .catch((err) =>
        console.error("Error while establishing connection :", err)
      );

    // Set up event handlers
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.connection) {
      console.error("SignalR connection is not initialized.");
      return;
    }

    // Handle receiving messages
    this.connection.on("ReceiveMessage", (message: any) => {
      console.log("Received message: ", message);
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
}

export default PlayFabPubSub;
