/*
 * PlayFab Lobby — the shared "room" that relays live match state. Two ways in:
 *   - joinArranged: after matchmaking, every matched player joins the SAME
 *     arranged lobby from their own arrangement string (no host election).
 *   - create / join: private "play with a friend" lobbies. The host creates one
 *     and shares its ConnectionString as a room code; the friend joins with it.
 *
 * State relay is per-member data under the key "snap" (a SnapshotWire JSON
 * string), read back for every member via getLobby. Key + shape are identical
 * to the iOS LobbyClient so web and iOS interoperate. All calls use the entity
 * token (X-EntityToken).
 */
import { PLAYFAB_BASE_API } from "./config";
import { EntityKey, EntityTokenResponse } from "./types";

async function entityPost<T>(
  endpoint: string,
  token: EntityTokenResponse,
  body: object
): Promise<T> {
  const res = await fetch(PLAYFAB_BASE_API + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-EntityToken": token.EntityToken,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.errorMessage || `PlayFab ${endpoint} failed (${res.status})`);
  }
  return json.data as T;
}

const MEMBER_DATA_KEY = "snap";

/** Join (or create if first) the arranged lobby for a matchmade match. */
export async function joinArrangedLobby(
  token: EntityTokenResponse,
  entity: EntityKey,
  arrangementString: string,
  maxPlayers: number
): Promise<string> {
  const data = await entityPost<{ LobbyId: string }>(
    "Lobby/JoinArrangedLobby",
    token,
    {
      ArrangementString: arrangementString,
      MemberEntity: entity,
      MaxPlayers: maxPlayers,
      OwnerMigrationPolicy: "Automatic",
      AccessType: "Private",
      UseConnections: true,
    }
  );
  return data.LobbyId;
}

export interface CreatedLobby {
  lobbyId: string;
  connectionString: string;
}

/** Create a private lobby; returns its id + the connection string to share. */
export async function createLobby(
  token: EntityTokenResponse,
  entity: EntityKey,
  maxPlayers: number
): Promise<CreatedLobby> {
  const data = await entityPost<{ LobbyId: string; ConnectionString: string }>(
    "Lobby/CreateLobby",
    token,
    {
      Owner: entity,
      MaxPlayers: maxPlayers,
      AccessType: "Private",
      Members: [{ MemberEntity: entity }],
      UseConnections: true,
    }
  );
  return { lobbyId: data.LobbyId, connectionString: data.ConnectionString };
}

/** Join a private lobby by its shared connection string. */
export async function joinLobby(
  token: EntityTokenResponse,
  entity: EntityKey,
  connectionString: string
): Promise<string> {
  const data = await entityPost<{ LobbyId: string }>("Lobby/JoinLobby", token, {
    ConnectionString: connectionString,
    MemberEntity: entity,
  });
  return data.LobbyId;
}

export async function leaveLobby(
  token: EntityTokenResponse,
  entity: EntityKey,
  lobbyId: string
): Promise<void> {
  try {
    await entityPost("Lobby/LeaveLobby", token, {
      MemberEntity: entity,
      LobbyId: lobbyId,
    });
  } catch {
    /* best effort on teardown */
  }
}

/** Publish this player's snapshot JSON into member data under "snap". */
export async function publishSnapshot(
  token: EntityTokenResponse,
  entity: EntityKey,
  lobbyId: string,
  snapshotJSON: string
): Promise<void> {
  await entityPost("Lobby/UpdateLobby", token, {
    LobbyId: lobbyId,
    MemberEntity: entity,
    MemberData: { [MEMBER_DATA_KEY]: snapshotJSON },
  });
}

export interface LobbySnapshotEntry {
  entityId: string;
  snapshotJSON: string;
}

/** Read every member's "snap" string, keyed by entity id (includes self). */
export async function getLobbySnapshots(
  token: EntityTokenResponse,
  lobbyId: string
): Promise<LobbySnapshotEntry[]> {
  const data = await entityPost<{
    Lobby?: {
      Members?: {
        MemberEntity?: { Id: string };
        MemberData?: Record<string, string>;
      }[];
    };
  }>("Lobby/GetLobby", token, { LobbyId: lobbyId });
  const out: LobbySnapshotEntry[] = [];
  for (const m of data.Lobby?.Members ?? []) {
    const id = m.MemberEntity?.Id;
    const snap = m.MemberData?.[MEMBER_DATA_KEY];
    if (id && snap) out.push({ entityId: id, snapshotJSON: snap });
  }
  return out;
}

/** All member entity ids in a lobby (regardless of whether they've published). */
export async function getLobbyMemberIds(
  token: EntityTokenResponse,
  lobbyId: string
): Promise<string[]> {
  const data = await entityPost<{
    Lobby?: { Members?: { MemberEntity?: { Id: string } }[] };
  }>("Lobby/GetLobby", token, { LobbyId: lobbyId });
  return (data.Lobby?.Members ?? [])
    .map((m) => m.MemberEntity?.Id)
    .filter((x): x is string => !!x);
}

/** Subscribe this lobby's change feed to a PubSub connection handle. */
export async function subscribeToLobby(
  token: EntityTokenResponse,
  entity: EntityKey,
  lobbyId: string,
  connectionHandle: string
): Promise<void> {
  await entityPost("Lobby/SubscribeToLobbyResource", token, {
    Type: "LobbyChange",
    EntityKey: entity,
    ResourceId: lobbyId,
    SubscriptionVersion: 1,
    PubSubConnectionHandle: connectionHandle,
  });
}
