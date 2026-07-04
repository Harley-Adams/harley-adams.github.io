/* Shared PlayFab types — a minimal subset of the SDK models we actually use. */

export interface EntityKey {
  Id: string;
  Type: string;
}

export interface EntityTokenResponse {
  Entity: EntityKey;
  EntityToken: string;
  TokenExpiration: string;
}

/** The signed-in player. Session ticket drives the classic Client/* API;
 *  the entity token drives Lobby/* and PubSub/*. */
export interface PlayFabSession {
  playFabId: string;
  sessionTicket: string;
  entityToken: EntityTokenResponse;
  displayName: string;
}

/* ---- Classic statistics + leaderboards --------------------------------- */

export interface StatisticValue {
  StatisticName: string;
  Value: number;
  Version: number;
}

export interface LeaderboardEntry {
  PlayFabId: string;
  DisplayName: string | null;
  StatValue: number;
  Position: number;
}

/* ---- Lobby (multiplayer) ----------------------------------------------- */

export interface LobbyMember {
  MemberEntity: EntityKey;
  MemberData?: { [key: string]: string };
  PubSubConnectionHandle?: string;
}

export interface LobbySummary {
  LobbyId: string;
  ConnectionString: string;
  CurrentPlayers: number;
  MaxPlayers: number;
  Membership?: LobbyMember[];
  LobbyData?: { [key: string]: string };
  SearchData?: { [key: string]: string };
}

export interface FindLobbiesResult {
  Lobbies: LobbySummary[];
}

export interface CreateLobbyResult {
  LobbyId: string;
  ConnectionString: string;
}

export interface JoinLobbyResult {
  LobbyId: string;
}
