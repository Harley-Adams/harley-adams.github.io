/*
 * PlayFab PubSub — a SignalR socket that pushes a notification whenever a
 * subscribed lobby changes. We treat every push as "refetch the lobby" (the
 * relay then calls getLobbySnapshots), exactly like the iOS PubSubClient, so we
 * never depend on the push payload shape. A short keepalive ping stops the
 * SignalR service from dropping the idle socket mid-match.
 */
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { PLAYFAB_BASE_API } from "./config";
import { EntityKey, EntityTokenResponse } from "./types";
import { subscribeToLobby } from "./lobby";

interface NegotiateResponse {
  accessToken: string;
  url: string;
}

interface StartSessionResponse {
  newConnectionHandle: string;
}

export class LobbyPubSub {
  private connection: HubConnection | null = null;
  private keepAlive: ReturnType<typeof setInterval> | null = null;

  /** Connect, subscribe the lobby, and invoke `onChanged` on every push. */
  async connect(
    token: EntityTokenResponse,
    entity: EntityKey,
    lobbyId: string,
    onChanged: () => void
  ): Promise<void> {
    const negotiate = await this.negotiate(token);
    await this.openConnection(negotiate.url, negotiate.accessToken, onChanged);
    const session = await this.startSession();
    await subscribeToLobby(token, entity, lobbyId, session.newConnectionHandle);
  }

  private async negotiate(token: EntityTokenResponse): Promise<NegotiateResponse> {
    // Note: the negotiate response is NOT wrapped in the usual data envelope.
    const res = await fetch(PLAYFAB_BASE_API + "PubSub/Negotiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": token.EntityToken,
      },
    });
    if (!res.ok) throw new Error(`PubSub negotiate failed (${res.status})`);
    return (await res.json()) as NegotiateResponse;
  }

  private openConnection(
    url: string,
    accessToken: string,
    onChanged: () => void
  ): Promise<void> {
    this.connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => accessToken,
        headers: { "X-EntityToken": accessToken },
      })
      .withAutomaticReconnect()
      .withKeepAliveInterval(5000)
      .configureLogging(LogLevel.Warning)
      .build();

    // Any lobby-change message means "go refetch"; we don't parse the payload.
    this.connection.on("ReceiveMessage", () => onChanged());

    return this.connection.start().then(() => {
      // Belt-and-braces keepalive ping so the socket doesn't die when idle.
      this.keepAlive = setInterval(() => {
        this.connection?.send("ping").catch(() => {});
      }, 5000);
    });
  }

  private async startSession(): Promise<StartSessionResponse> {
    if (!this.connection) throw new Error("No PubSub connection");
    return (await this.connection.invoke("StartOrRecoverSession", {
      traceParent: traceParent(),
      oldConnectionHandle: null,
    })) as StartSessionResponse;
  }

  async disconnect(): Promise<void> {
    if (this.keepAlive) {
      clearInterval(this.keepAlive);
      this.keepAlive = null;
    }
    try {
      await this.connection?.stop();
    } catch {
      /* ignore */
    }
    this.connection = null;
  }
}

function traceParent(): string {
  const hex = (len: number) =>
    Array.from({ length: len }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0")
    ).join("");
  return `00-${hex(16)}-${hex(8)}-01`;
}
