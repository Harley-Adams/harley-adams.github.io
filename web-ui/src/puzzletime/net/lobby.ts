/* PlayFab Lobby API (entity-token authenticated) for multiplayer matchmaking. */
import { PLAYFAB_BASE_API } from "./config";
import {
  CreateLobbyResult,
  EntityKey,
  EntityTokenResponse,
  FindLobbiesResult,
  JoinLobbyResult,
} from "./types";

async function lobbyPost<T>(
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

export function createLobby(
  token: EntityTokenResponse,
  owner: EntityKey,
  lobbyData: { [key: string]: string },
  searchData: { [key: string]: string }
): Promise<CreateLobbyResult> {
  return lobbyPost<CreateLobbyResult>("Lobby/CreateLobby", token, {
    MaxPlayers: 16,
    AccessPolicy: "Public",
    Owner: owner,
    UseConnections: true,
    Members: [{ MemberEntity: owner }],
    LobbyData: lobbyData,
    SearchData: searchData,
  });
}

/** Find open PuzzleTime versus lobbies still in the pre-game state. */
export function findLobbies(
  token: EntityTokenResponse
): Promise<FindLobbiesResult> {
  return lobbyPost<FindLobbiesResult>("Lobby/FindLobbies", token, {
    Filter: "string_key1 eq 'wordle'",
    OrderBy: "lobby/memberCount desc",
  });
}

export function joinLobby(
  token: EntityTokenResponse,
  connectionString: string,
  member: EntityKey
): Promise<JoinLobbyResult> {
  return lobbyPost<JoinLobbyResult>("Lobby/JoinLobby", token, {
    ConnectionString: connectionString,
    MemberEntity: member,
  });
}

export function leaveLobby(
  token: EntityTokenResponse,
  lobbyId: string,
  member: EntityKey
): Promise<object> {
  return lobbyPost<object>("Lobby/LeaveLobby", token, {
    MemberEntity: member,
    LobbyId: lobbyId,
  });
}
