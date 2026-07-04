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

/** Push handler. Receives the parsed member changes from a lobby-change push,
 *  or `null` when a push arrived that we couldn't fully parse (or membership may
 *  have changed) — in which case the caller should fall back to a GetLobby. */
export type LobbyChangeHandler = (changes: LobbyMemberChange[] | null) => void;

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

export class LobbyPubSub {
  private connection: HubConnection | null = null;
  // Subscription context, kept so we can re-subscribe after a reconnect.
  private token: EntityTokenResponse | null = null;
  private entity: EntityKey | null = null;
  private lobbyId: string | null = null;
  private onChanged: LobbyChangeHandler | null = null;
  private onState: ((state: PubSubState) => void) | null = null;

  /** Connect, subscribe the lobby, and invoke `onChanged` on every push with
   *  the parsed member changes. `onState` reports the socket lifecycle. */
  async connect(
    token: EntityTokenResponse,
    entity: EntityKey,
    lobbyId: string,
    onChanged: LobbyChangeHandler,
    onState?: (state: PubSubState) => void
  ): Promise<void> {
    this.token = token;
    this.entity = entity;
    this.lobbyId = lobbyId;
    this.onChanged = onChanged;
    this.onState = onState ?? null;
    this.onState?.("connecting");
    const negotiate = await this.negotiate(token);
    await this.openConnection(negotiate.url, negotiate.accessToken, onChanged);
    await this.startAndSubscribe();
    this.onState?.("live");
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
    onChanged: LobbyChangeHandler
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

    // Each lobby-change push carries the changed member data (including the
    // full "snap"), so we parse it and hand the changes to the relay to apply
    // directly — no GetLobby round-trip. A frame we can't parse yields null,
    // which tells the relay to reconcile via GetLobby instead.
    connection.on("ReceiveMessage", (...args: unknown[]) => {
      onChanged(parseLobbyChanges(args));
    });

    // Surface the socket lifecycle so the UI can show whether we're live.
    connection.onreconnecting(() => this.onState?.("reconnecting"));

    // After an automatic reconnect the socket has a brand-new connection handle,
    // so the old lobby subscription no longer routes to it. Re-run the session +
    // subscribe handshake and force a full reconcile (null) so we don't miss the
    // changes that happened while we were disconnected.
    connection.onreconnected(() => {
      this.startAndSubscribe()
        .then(() => {
          this.onState?.("live");
          onChanged(null);
        })
        .catch(() => this.onState?.("offline"));
    });

    // Reconnect attempts exhausted (or an explicit close). The relay falls back
    // to polling from here.
    connection.onclose(() => this.onState?.("offline"));

    this.connection = connection;
    return connection.start();
  }

  /** (Re)establish the PubSub session and subscribe the lobby to this socket. */
  private async startAndSubscribe(): Promise<void> {
    if (!this.connection || !this.token || !this.entity || !this.lobbyId) return;
    const session = await this.startSession();
    await subscribeToLobby(
      this.token,
      this.entity,
      this.lobbyId,
      session.newConnectionHandle
    );
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
    this.lobbyId = null;
    this.onChanged = null;
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
