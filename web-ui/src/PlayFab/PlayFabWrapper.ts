import { PlayFabBaseAPI, PlayFabTitleId } from "../Constants";
import {
  GetEntityLeaderboardResponse,
  GetLeaderboardAroundEntityRequest,
  GetLeaderboardRequest,
  GetStatisticsPayload,
  GetStatisticsResponse,
  UpdateStatisticsPayload,
} from "./PlayFabLeaderboards";
import { PlayFabMultiplayerModels } from "./PlayFabMultiplayerModule";
import PfLoginResult, { EntityTokenResponse } from "./models/PfLoginResult";
import PfV2LeaderboardResult from "./models/PfV2LeaderboardResult";

export async function loginWithCustomId(
  customId: string,
  callback: (loginResult: PfLoginResult) => void
): Promise<void> {
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
      callback(storedLoginResult);
      return;
    }
  }

  let apiEndpoint = `${PlayFabBaseAPI}Client/LoginWithCustomID`;
  const data = {
    TitleId: PlayFabTitleId,
    CreateAccount: true,
    CustomId: customId,
  };

  await fetch(apiEndpoint, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (response) => {
    if (response.status === 200) {
      let rawResponse = await response.json();
      let loginResult: PfLoginResult = {
        PlayFabId: rawResponse.data.PlayFabId,
        EntityToken: rawResponse.data.EntityToken,
        SessionTicket: rawResponse.data.SessionTicket,
      };

      callback(loginResult);
      localStorage.setItem(loginResultCacheKey, JSON.stringify(loginResult));

      UpdateDisplayName(customId, loginResult.EntityToken.EntityToken).then(
        () => {
          console.log("display name updated");
        }
      );
    } else {
      console.log(`playfab login error: ${await response.text()}`);
    }
  });
}

export async function UpdateDisplayName(displayName: string, token: string) {
  let apiEndpoint = PlayFabBaseAPI + `Client/UpdateUserTitleDisplayName`;

  const data = {
    DisplayName: displayName,
  };

  return fetch(apiEndpoint, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": token,
    },
  }).then(async (response) => {
    if (response.status === 200) {
      console.log(`namechange ${await response.text()}`);
    } else {
      // tslint:disable-next-line: no-console
      console.log(`playfab update name error: ${await response.text()}`);
    }
  });
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

  const payload: UpdateStatisticsPayload = {
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

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-EntityToken": entityToken.EntityToken,
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = `An error has occurred updating stats: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export function GetStatistics(
  entityToken: EntityTokenResponse,
  callback: (statsResult: GetStatisticsResponse) => void
) {
  let apiEndpoint = PlayFabBaseAPI + `Statistic/GetStatistics`;

  const payload: GetStatisticsPayload = {
    Entity: entityToken.Entity,
  };

  const response = fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-EntityToken": entityToken.EntityToken,
    },

    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        callback(rawResponse.data);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab lobby error: ${await response.text()}`);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

export function GetLeaderboard(
  entityToken: EntityTokenResponse,
  leaderboardName: string,
  callback: (leaderboardResult: GetEntityLeaderboardResponse) => void
) {
  let apiEndpoint = PlayFabBaseAPI + `Leaderboard/GetLeaderboard`;

  const payload: GetLeaderboardRequest = {
    LeaderboardName: leaderboardName,
    StartingPosition: 1,
    PageSize: 20,
  };

  const response = fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-EntityToken": entityToken.EntityToken,
    },

    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        callback(rawResponse.data);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab lobby error: ${await response.text()}`);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

export function GetLeaderboardAroundEntity(
  entityToken: EntityTokenResponse,
  leaderboardName: string,
  callback: (leaderboardResult: GetEntityLeaderboardResponse) => void
) {
  let apiEndpoint = PlayFabBaseAPI + `Leaderboard/GetLeaderboardAroundEntity`;

  const payload: GetLeaderboardAroundEntityRequest = {
    LeaderboardName: leaderboardName,
    MaxSurroundingEntries: 20,
  };

  const response = fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-EntityToken": entityToken.EntityToken,
    },

    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        callback(rawResponse.data);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab get lb around error: ${await response.text()}`);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

export default class PlayFabWrapper {
  public GetV2Leaderboard(
    entityToken: EntityTokenResponse,
    statName: string,
    callback: (leaderboardResult: PfV2LeaderboardResult) => void
  ) {
    let apiEndpoint = PlayFabBaseAPI + `Leaderboard/GetLeaderboard`;

    const data = {
      EntityType: "title_player_account",
      LeaderboardName: statName,
      PageSize: 20,
    };

    fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": `${entityToken.EntityToken}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        let lbResponse: PfV2LeaderboardResult = {
          Rankings: rawResponse.data.Rankings,
          StatisticVersion: rawResponse.data.StatisticVersion,
        };

        callback(lbResponse);
        // tslint:disable-next-line: no-console
        console.log(`playfab v2lb fetch: ${JSON.stringify(rawResponse)}`);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab v2lb fetch error: ${await response.text()}`);
      }
    });
  }

  public GetV2LeaderboardAroundPlayer(
    entityToken: EntityTokenResponse,
    statName: string,
    centerEntity: string,
    callback: (leaderboardResult: PfV2LeaderboardResult) => void
  ) {
    let apiEndpoint = PlayFabBaseAPI + `Leaderboard/GetLeaderboardAroundEntity`;

    const data = {
      LeaderboardName: statName,
      MaxSurroundingEntries: 20,
      AuthenticationContext: {
        EntityToken: entityToken.EntityToken,
      },
      Entity: {
        Id: entityToken.Entity.Id,
        Type: "title_player_account",
      },
    };

    fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": `${entityToken.EntityToken}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        let lbResponse: PfV2LeaderboardResult = {
          Rankings: rawResponse.data.Rankings,
          StatisticVersion: rawResponse.data.StatisticVersion,
        };

        callback(lbResponse);
        // tslint:disable-next-line: no-console
        console.log(`playfab v2lb fetch: ${JSON.stringify(rawResponse)}`);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab v2lb fetch error: ${await response.text()}`);
      }
    });
  }

  public GetV2LeaderboardForPlayers(
    entityToken: EntityTokenResponse,
    leaderboardName: string,
    entities: string[],
    callback: (leaderboardResult: PfV2LeaderboardResult) => void
  ) {
    let apiEndpoint = PlayFabBaseAPI + `Leaderboard/GetLeaderboardForEntities`;

    const data = {
      EntityType: "title_player_account",
      LeaderboardName: leaderboardName,
      Entity: entityToken.Entity,
      Entities: entities,
    };

    fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": `${entityToken.EntityToken}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        let lbResponse: PfV2LeaderboardResult = {
          Rankings: rawResponse.data.Rankings,
          StatisticVersion: rawResponse.data.StatisticVersion,
        };

        callback(lbResponse);
        // tslint:disable-next-line: no-console
        console.log(`playfab v2lb fetch: ${JSON.stringify(rawResponse)}`);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab v2lb fetch error: ${await response.text()}`);
      }
    });
  }

  public GetLobbies(
    entityToken: EntityTokenResponse,
    callback: (
      getLobbiesResult: PlayFabMultiplayerModels.FindLobbiesResult
    ) => void
  ) {
    let apiEndpoint = PlayFabBaseAPI + `Lobby/FindLobbies`;

    const request: PlayFabMultiplayerModels.FindLobbiesRequest = {
      // Parameters here if needed
    };

    fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": `${entityToken.EntityToken}`,
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          let rawResponse = await response.json();
          callback(rawResponse.data);
        } else {
          // tslint:disable-next-line: no-console
          console.log(`playfab lobby error: ${await response.text()}`);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public JoinLobby(
    entityToken: EntityTokenResponse,
    lobbyConnectionString: string,
    callback: (
      joinLobbyResult: PlayFabMultiplayerModels.JoinLobbyResult
    ) => void
  ) {
    let apiEndpoint = PlayFabBaseAPI + `Lobby/JoinLobby`;

    const request: PlayFabMultiplayerModels.JoinLobbyRequest = {
      ConnectionString: lobbyConnectionString,
      MemberEntity: entityToken.Entity,
      // Additional parameters here if needed
    };
    fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": `${entityToken.EntityToken}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        callback(rawResponse.data);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab lobby error: ${await response.text()}`);
      }
    });
  }

  public LeaveLobby(
    entityToken: EntityTokenResponse,
    lobbyId: string,
    callback: (
      joinLobbyResult: PlayFabMultiplayerModels.LobbyEmptyResult
    ) => void
  ) {
    let apiEndpoint = PlayFabBaseAPI + `Lobby/LeaveLobby`;

    const request: PlayFabMultiplayerModels.LeaveLobbyRequest = {
      MemberEntity: entityToken.Entity,
      LobbyId: lobbyId,
      // Additional parameters here if needed
    };
    console.log(`try leave lobby: ${lobbyId}`);

    fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": `${entityToken.EntityToken}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        callback(rawResponse.data);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab leave error: ${await response.text()}`);
      }
    });
  }

  public CreateLobby(
    entityToken: EntityTokenResponse,
    connectionsEnabled: boolean,
    lobbyData: { [key: string]: string | null },
    members: PlayFabMultiplayerModels.Member[],
    callback: (
      createLobbyResult: PlayFabMultiplayerModels.CreateLobbyResult
    ) => void
  ) {
    let apiEndpoint = PlayFabBaseAPI + `Lobby/CreateLobby`;

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

    fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        "X-EntityToken": `${entityToken.EntityToken}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        callback(rawResponse.data);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab lobby error: ${await response.text()}`);
      }
    });
  }
}
