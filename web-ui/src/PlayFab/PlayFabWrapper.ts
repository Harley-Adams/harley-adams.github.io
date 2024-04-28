import { PlayFabBaseAPI, PlayFabTitleId } from "../Constants";
import {
  GetEntityLeaderboardResponse,
  GetLeaderboardAroundEntityRequest,
  GetLeaderboardRequest,
  GetStatisticsPayload,
  GetStatisticsResponse,
  UpdateStatisticsPayload,
} from "./modules/PlayFabLeaderboardsModule";
import { PlayFabMultiplayerModels } from "./modules/PlayFabMultiplayerModule";
import PfLoginResult, { EntityTokenResponse } from "./models/PfLoginResult";

export async function loginWithCustomId(
  customId: string
): Promise<PfLoginResult | null> {
  const loginResultCacheKey = `PfLoginResult:${customId}`;
  const storedPfLoginResult = localStorage.getItem(loginResultCacheKey);

  if (storedPfLoginResult != null) {
    let storedLoginResult: PfLoginResult = JSON.parse(storedPfLoginResult);
    let tokenExpiration = Date.parse(
      storedLoginResult.EntityToken.TokenExpiration
    );
    const oneHourFromNow = Date.now() + 60 * 60 * 1000;

    if (tokenExpiration >= oneHourFromNow) {
      console.log("Found login with valid time");
      return storedLoginResult;
    }
  }

  let apiEndpoint = `${PlayFabBaseAPI}Client/LoginWithCustomID`;
  const data = {
    TitleId: PlayFabTitleId,
    CreateAccount: true,
    CustomId: customId,
  };

  const loginResponse = await fetch(apiEndpoint, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (loginResponse.status === 200) {
    let rawResponse = await loginResponse.json();
    let loginResult: PfLoginResult = {
      PlayFabId: rawResponse.data.PlayFabId,
      EntityToken: rawResponse.data.EntityToken,
      SessionTicket: rawResponse.data.SessionTicket,
    };
    localStorage.setItem(loginResultCacheKey, JSON.stringify(loginResult));

    await UpdateDisplayName(loginResult.EntityToken, customId);

    return loginResult;
  } else {
    console.log(`playfab login error: ${await loginResponse.text()}`);
  }

  return null;
}

export async function UpdateDisplayName(
  entityToken: EntityTokenResponse,
  displayName: string
) {
  let apiEndpoint = PlayFabBaseAPI + `Client/UpdateUserTitleDisplayName`;

  const request = {
    DisplayName: displayName,
  };

  return await makePlayFabApiRequest<GetStatisticsResponse>(
    apiEndpoint,
    entityToken.EntityToken,
    request
  );
}

export async function UpdateWordleStatistics(
  entityToken: EntityTokenResponse,
  word: string,
  guessesMade: number,
  timeTaken: number,
  numberOfWrongLetters: number,
  numberOfMisplacedLetters: number
) {
  let apiEndpoint = PlayFabBaseAPI + `Statistic/UpdateStatistics`;

  const request: UpdateStatisticsPayload = {
    Statistics: [
      {
        Name: "WordleBestGame",
        Metadata: word,
        Scores: [
          guessesMade.toString(),
          timeTaken.toString(),
          numberOfWrongLetters.toString(),
          numberOfMisplacedLetters.toString(),
        ],
      },
      {
        Name: "WordleBestGameDaily",
        Metadata: word,
        Scores: [
          guessesMade.toString(),
          timeTaken.toString(),
          numberOfWrongLetters.toString(),
          numberOfMisplacedLetters.toString(),
        ],
      },
      {
        Name: "WordleTopPlayers",
        Scores: [
          "1",
          guessesMade.toString(),
          timeTaken.toString(),
          numberOfWrongLetters.toString(),
          numberOfMisplacedLetters.toString(),
        ],
      },
      {
        Name: "WordleTopPlayersDaily",
        Scores: [
          "1",
          guessesMade.toString(),
          timeTaken.toString(),
          numberOfWrongLetters.toString(),
          numberOfMisplacedLetters.toString(),
        ],
      },
    ],
    Entity: entityToken.Entity,
  };

  return await makePlayFabApiRequest<GetStatisticsResponse>(
    apiEndpoint,
    entityToken.EntityToken,
    request
  );
}

export async function GetStatistics(
  entityToken: EntityTokenResponse
): Promise<GetStatisticsResponse | null> {
  let apiEndpoint = PlayFabBaseAPI + `Statistic/GetStatistics`;

  const request: GetStatisticsPayload = {
    Entity: entityToken.Entity,
  };

  return await makePlayFabApiRequest<GetStatisticsResponse>(
    apiEndpoint,
    entityToken.EntityToken,
    request
  );
}

export async function GetLeaderboard(
  entityToken: EntityTokenResponse,
  leaderboardName: string,
  version?: number
): Promise<GetEntityLeaderboardResponse | null> {
  let apiEndpoint = PlayFabBaseAPI + `Leaderboard/GetLeaderboard`;

  const request: GetLeaderboardRequest = {
    LeaderboardName: leaderboardName,
    StartingPosition: 1,
    PageSize: 20,
    Version: version,
  };

  return await makePlayFabApiRequest<GetEntityLeaderboardResponse>(
    apiEndpoint,
    entityToken.EntityToken,
    request
  );
}

export async function GetLeaderboardAroundEntity(
  entityToken: EntityTokenResponse,
  leaderboardName: string
): Promise<GetEntityLeaderboardResponse | null> {
  let apiEndpoint = PlayFabBaseAPI + `Leaderboard/GetLeaderboardAroundEntity`;

  const request: GetLeaderboardAroundEntityRequest = {
    LeaderboardName: leaderboardName,
    MaxSurroundingEntries: 20,
  };

  return await makePlayFabApiRequest<GetEntityLeaderboardResponse>(
    apiEndpoint,
    entityToken.EntityToken,
    request
  );
}

export async function GetLobbies(
  entityToken: EntityTokenResponse
): Promise<PlayFabMultiplayerModels.FindLobbiesResult | null> {
  let apiEndpoint = PlayFabBaseAPI + `Lobby/FindLobbies`;

  return await makePlayFabApiRequest<PlayFabMultiplayerModels.FindLobbiesResult>(
    apiEndpoint,
    entityToken.EntityToken
  );
}

export async function JoinLobby(
  entityToken: EntityTokenResponse,
  lobbyConnectionString: string
): Promise<PlayFabMultiplayerModels.JoinLobbyResult | null> {
  let apiEndpoint = PlayFabBaseAPI + `Lobby/JoinLobby`;

  const request: PlayFabMultiplayerModels.JoinLobbyRequest = {
    ConnectionString: lobbyConnectionString,
    MemberEntity: entityToken.Entity,
  };

  return await makePlayFabApiRequest<PlayFabMultiplayerModels.JoinLobbyResult>(
    apiEndpoint,
    entityToken.EntityToken,
    request
  );
}

export async function LeaveLobby(
  entityToken: EntityTokenResponse,
  lobbyId: string
): Promise<PlayFabMultiplayerModels.LobbyEmptyResult | null> {
  let apiEndpoint = PlayFabBaseAPI + `Lobby/LeaveLobby`;

  const request: PlayFabMultiplayerModels.LeaveLobbyRequest = {
    MemberEntity: entityToken.Entity,
    LobbyId: lobbyId,
  };

  return await makePlayFabApiRequest<PlayFabMultiplayerModels.LobbyEmptyResult>(
    apiEndpoint,
    entityToken.EntityToken,
    request
  );
}

export async function CreateLobby(
  entityToken: EntityTokenResponse,
  connectionsEnabled: boolean,
  lobbyData: { [key: string]: string | null },
  members: PlayFabMultiplayerModels.Member[]
): Promise<PlayFabMultiplayerModels.CreateLobbyResult | null> {
  let apiEndpoint = `Lobby/CreateLobby`;

  const request: PlayFabMultiplayerModels.CreateLobbyRequest = {
    LobbyData: lobbyData,
    // Additional parameters here if needed
    MaxPlayers: 128,
    AccessPolicy: "Public",
    Owner: entityToken.Entity,
    UseConnections: connectionsEnabled,
    Members: members,
    // OwnerMigrationPolicy: "Automatic",
  };

  return await makePlayFabApiRequest<PlayFabMultiplayerModels.CreateLobbyResult>(
    apiEndpoint,
    entityToken.EntityToken,
    request
  );
}

async function makePlayFabApiRequest<T>(
  endpoint: string,
  token: string,
  data?: object
): Promise<T | null> {
  try {
    const response = await fetch(`${PlayFabBaseAPI}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": token,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      return jsonResponse.data as T;
    } else {
      console.error(`API error: ${await response.text()}`);
      return null;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}
