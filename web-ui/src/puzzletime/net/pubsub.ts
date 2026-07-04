/*
 * PlayFab PubSub — realtime lobby updates over SignalR. Negotiates a connection,
 * subscribes to a lobby's change feed, and decodes member/lobby payloads. Also
 * exposes updateLobby to broadcast this player's data (and, for the host, the
 * shared game data) to everyone subscribed. Ported from the prior implementation.
 */
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { PLAYFAB_BASE_API } from "./config";
import { EntityKey, EntityTokenResponse } from "./types";

interface NegotiateResponse {
  accessToken: string;
  url: string;
}

interface StartSessionResponse {
  newConnectionHandle: string;
  status: string;
  traceId: string;
}

export interface MemberChange<PlayerData> {
  memberEntity: EntityKey;
  memberData: PlayerData | null;
}

export interface LobbyChange<LobbyData, PlayerData> {
  changeNumber: number;
  memberToMerge?: {
    memberEntity: EntityKey;
    memberData?: { d: string } | PlayerData;
  };
  lobbyData?: LobbyData;
}

export interface PubSubMessage<LobbyData, PlayerData> {
  lobbyId: string;
  lobbyChanges: LobbyChange<LobbyData, PlayerData>[];
}

export class PlayFabPubSub<LobbyData, PlayerData> {
  private connection: HubConnection | null = null;

  async connect(
    token: EntityTokenResponse,
    lobbyId: string,
    onSubscribed: () => void,
    onMessage: (msg: PubSubMessage<LobbyData, PlayerData>) => void
  ): Promise<void> {
    const negotiate = await this.negotiate(token);
    await this.openConnection(negotiate.url, negotiate.accessToken, onMessage);
    const session = await this.startSession();
    await this.subscribe(token, session.newConnectionHandle, lobbyId);
    onSubscribed();
  }

  private async negotiate(token: EntityTokenResponse): Promise<NegotiateResponse> {
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
    onMessage: (msg: PubSubMessage<LobbyData, PlayerData>) => void
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

    this.connection.on("ReceiveMessage", (message: { payload: string }) => {
      try {
        const update = JSON.parse(atob(message.payload)) as PubSubMessage<
          LobbyData,
          PlayerData
        >;
        update.lobbyChanges?.forEach((change) => {
          const md = change.memberToMerge?.memberData as { d?: string } | undefined;
          if (md?.d && change.memberToMerge) {
            change.memberToMerge.memberData = JSON.parse(atob(md.d)) as PlayerData;
          }
        });
        onMessage(update);
      } catch (err) {
        console.error("Failed to parse pubsub message", err);
      }
    });

    return this.connection.start();
  }

  private async startSession(): Promise<StartSessionResponse> {
    if (!this.connection) throw new Error("No connection");
    return (await this.connection.invoke("StartOrRecoverSession", {
      traceId: traceParent(),
    })) as StartSessionResponse;
  }

  private async subscribe(
    token: EntityTokenResponse,
    pubsubHandle: string,
    lobbyId: string
  ): Promise<void> {
    const res = await fetch(PLAYFAB_BASE_API + "Lobby/SubscribeToLobbyResource", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": token.EntityToken,
      },
      body: JSON.stringify({
        EntityKey: token.Entity,
        PubSubConnectionHandle: pubsubHandle,
        ResourceId: lobbyId,
        SubscriptionVersion: 1,
        Type: "LobbyChange",
      }),
    });
    if (!res.ok) throw new Error(`Subscribe to lobby failed (${res.status})`);
  }

  /** Broadcast this member's data and/or (host-only) the shared lobby data. */
  async updateLobby(
    token: EntityTokenResponse,
    lobbyId: string,
    opts: { lobbyData?: LobbyData; playerData?: PlayerData }
  ): Promise<void> {
    const body: {
      LobbyId: string;
      MemberEntity: EntityKey;
      MemberData?: { d: string };
      LobbyData?: LobbyData;
    } = {
      LobbyId: lobbyId,
      MemberEntity: token.Entity,
    };
    if (opts.playerData !== undefined) {
      body.MemberData = { d: btoa(JSON.stringify(opts.playerData)) };
    }
    if (opts.lobbyData !== undefined) {
      body.LobbyData = opts.lobbyData;
    }
    const res = await fetch(PLAYFAB_BASE_API + "Lobby/UpdateLobby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": token.EntityToken,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`UpdateLobby failed: ${await res.text()}`);
    }
  }

  async disconnect(): Promise<void> {
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
