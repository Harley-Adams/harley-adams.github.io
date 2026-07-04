/*
 * PlayFab PubSub — a SignalR socket that pushes a notification whenever a
 * subscribed lobby changes. We treat every push as "refetch the lobby" (the
 * relay then calls getLobbySnapshots), exactly like the iOS PubSubClient, so we
 * never depend on the push payload shape.
 *
 * Keepalive: we rely on SignalR's built-in protocol ping (withKeepAliveInterval)
 * — the client sends `{"type":6}` frames, matching what the iOS client does by
 * hand. We also widen the server timeout so a quiet match (nobody guessing for a
 * while, so PlayFab sends nothing) doesn't make the client declare the socket
 * dead and tear it down. If the socket does drop and auto-reconnect, we
 * re-subscribe the lobby to the *new* connection handle — otherwise the
 * reconnected socket would stay silent and updates would stop mid-match.
 */
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { PLAYFAB_BASE_API } from "./config";
import { EntityKey, EntityTokenResponse } from "./types";
import { subscribeToLobby } from "./lobby";
import { subscribeToMatchTicket } from "./matchmaking";

interface NegotiateResponse {
  accessToken: string;
  url: string;
}

interface StartSessionResponse {
  newConnectionHandle: string;
}

/** Live state of the realtime relay socket, surfaced to the UI. */
export type PubSubState = "connecting" | "live" | "reconnecting" | "offline";

/** One member's change parsed out of a lobby-change push. `snap` is present
 *  when this change updated the member's "snap" data (i.e. their board state);
 *  it's absent for non-data changes like a member (re)subscribing. */
export interface LobbyMemberChange {
  entityId: string;
  changeNumber: number;
  snap?: string;
}

/** What a PubSub connection is subscribed to. */
export type PubSubResource =
  | { kind: "lobby"; lobbyId: string }
  | { kind: "matchTicket"; queue: string; ticketId: string };

/** A push event handed to the consumer. A lobby subscription carries the parsed
 *  member changes (or null → reconcile via GetLobby). A match-ticket
 *  subscription is just a "status may have changed, go poll the ticket" signal
 *  (the payload shape isn't relied upon). */
export type PubSubEvent =
  | { kind: "lobby"; changes: LobbyMemberChange[] | null }
  | { kind: "match" };

export type PubSubEventHandler = (event: PubSubEvent) => void;

/** Decode the base64 JSON payload of a lobby-change push into member changes.
 *  Returns null if the frame shape is unrecognized so the caller can reconcile
 *  via GetLobby rather than silently dropping a change. */
export function parseLobbyChanges(args: unknown[]): LobbyMemberChange[] | null {
  try {
    const frame = args[0] as { payload?: string } | undefined;
    if (!frame?.payload) return null;
    const decoded = JSON.parse(atob(frame.payload)) as {
      lobbyChanges?: {
        changeNumber?: number;
        memberToMerge?: {
          memberEntity?: { Id?: string };
          memberData?: Record<string, string>;
        };
      }[];
    };
    const changes = decoded.lobbyChanges;
    if (!Array.isArray(changes)) return null;
    const out: LobbyMemberChange[] = [];
    for (const c of changes) {
      // Only member *merges* are safe to apply incrementally. Anything else
      // (a member removal, a lobby-property change, an unexpected shape) means
      // "go reconcile with GetLobby".
      const id = c.memberToMerge?.memberEntity?.Id;
      if (!id) return null;
      out.push({
        entityId: id,
        changeNumber: c.changeNumber ?? 0,
        snap: c.memberToMerge?.memberData?.snap,
      });
    }
    return out;
  } catch {
    return null;
  }
}

export class PlayFabPubSub {
  private connection: HubConnection | null = null;
  // Subscription context, kept so we can re-subscribe after a reconnect.
  private token: EntityTokenResponse | null = null;
  private entity: EntityKey | null = null;
  private resource: PubSubResource | null = null;
  private onEvent: PubSubEventHandler | null = null;
  private onState: ((state: PubSubState) => void) | null = null;

  /** Connect, subscribe to `resource`, and invoke `onEvent` on every push.
   *  `onState` reports the socket lifecycle for a UI indicator. */
  async connect(
    token: EntityTokenResponse,
    entity: EntityKey,
    resource: PubSubResource,
    onEvent: PubSubEventHandler,
    onState?: (state: PubSubState) => void
  ): Promise<void> {
    this.token = token;
    this.entity = entity;
    this.resource = resource;
    this.onEvent = onEvent;
    this.onState = onState ?? null;
    this.onState?.("connecting");
    const negotiate = await this.negotiate(token);
    await this.openConnection(negotiate.url, negotiate.accessToken);
    await this.startAndSubscribe();
    this.onState?.("live");
  }

  /** Deliver a push to the consumer, shaped per the subscribed resource. */
  private emitMessage(args: unknown[]): void {
    if (this.resource?.kind === "lobby") {
      this.onEvent?.({ kind: "lobby", changes: parseLobbyChanges(args) });
    } else {
      this.onEvent?.({ kind: "match" });
    }
  }

  /** Ask the consumer to reconcile from scratch (e.g. after a reconnect). */
  private emitReconcile(): void {
    if (this.resource?.kind === "lobby") {
      this.onEvent?.({ kind: "lobby", changes: null });
    } else {
      this.onEvent?.({ kind: "match" });
    }
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
    accessToken: string
  ): Promise<void> {
    const connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => accessToken,
        headers: { "X-EntityToken": accessToken },
      })
      .withAutomaticReconnect()
      .withKeepAliveInterval(5000)
      .configureLogging(LogLevel.Warning)
      .build();
    // Don't let a quiet match (no server traffic) trip the default 30s server
    // timeout and needlessly drop the socket. Our own keepalive pings hold it
    // open; the relay's safety poll covers anything we still miss.
    connection.serverTimeoutInMilliseconds = 120_000;

    // Lobby changes are pushed via `ReceiveMessage` and carry the changed
    // member's full "snap" so the relay can apply it without GetLobby.
    connection.on("ReceiveMessage", (...args: unknown[]) => {
      this.emitMessage(args);
    });

    // Match-ticket status changes are pushed via `ReceiveSubscriptionChangeMessage`
    // (a different client method than lobby changes). We treat it purely as a
    // "your subscription changed, go poll the ticket" signal.
    connection.on("ReceiveSubscriptionChangeMessage", () => {
      if (this.resource?.kind === "matchTicket") {
        this.onEvent?.({ kind: "match" });
      }
    });

    // Surface the socket lifecycle so the UI can show whether we're live.
    connection.onreconnecting(() => this.onState?.("reconnecting"));

    // After an automatic reconnect the socket has a brand-new connection handle,
    // so the old subscription no longer routes to it. Re-run the session +
    // subscribe handshake and force a full reconcile so we don't miss changes
    // that happened while we were disconnected.
    connection.onreconnected(() => {
      this.startAndSubscribe()
        .then(() => {
          this.onState?.("live");
          this.emitReconcile();
        })
        .catch(() => this.onState?.("offline"));
    });

    // Reconnect attempts exhausted (or an explicit close). The relay falls back
    // to polling from here.
    connection.onclose(() => this.onState?.("offline"));

    this.connection = connection;
    return connection.start();
  }

  /** (Re)establish the PubSub session and subscribe the resource to this socket. */
  private async startAndSubscribe(): Promise<void> {
    if (!this.connection || !this.token || !this.entity || !this.resource) return;
    const session = await this.startSession();
    if (this.resource.kind === "lobby") {
      await subscribeToLobby(
        this.token,
        this.entity,
        this.resource.lobbyId,
        session.newConnectionHandle
      );
    } else {
      await subscribeToMatchTicket(
        this.token,
        this.entity,
        this.resource.ticketId,
        session.newConnectionHandle,
        this.resource.queue
      );
    }
  }

  private async startSession(): Promise<StartSessionResponse> {
    if (!this.connection) throw new Error("No PubSub connection");
    return (await this.connection.invoke("StartOrRecoverSession", {
      traceParent: traceParent(),
      oldConnectionHandle: null,
    })) as StartSessionResponse;
  }

  async disconnect(): Promise<void> {
    const connection = this.connection;
    this.connection = null;
    this.token = null;
    this.entity = null;
    this.resource = null;
    this.onEvent = null;
    try {
      await connection?.stop();
    } catch {
      /* ignore */
    }
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
