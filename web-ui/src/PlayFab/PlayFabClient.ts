import PfLoginResult, { EntityTokenResponse } from "./models/PfLoginResult";
import PfV2LeaderboardResult from "./models/PfV2LeaderboardResult";

export default class PlayFabClient {
  private apiBase: string;
  private titleId: string;
  private titleSecret: string;

  constructor(titleId: string, titleSecret: string, useProd: boolean = true) {
    this.titleId = titleId;
    this.titleSecret = titleSecret;

    if (useProd) {
      this.apiBase = `https://${titleId}.playfabapi.com/`;
    } else {
      // this.apiBase = `https://${titleId}.matchmaking.playfabapi.com/`;
      this.apiBase = `https://${titleId}.api.mm.azureplayfabdev.com/`;
    }
  }

  public async GetTitleEntityToken(
    callback: (loginResult: EntityTokenResponse) => void
  ) {
    let apiEndpoint = this.apiBase + `/Authentication/GetEntityToken`;

    const data = {
      Entity: {
        // This is from game manager.
        Id: `${this.titleId}`,
        Type: "title",
      },
    };

    await fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "X-SecretKey": this.titleSecret,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        let loginResult: EntityTokenResponse = {
          EntityToken: rawResponse.data.EntityToken,
          Entity: rawResponse.data.Entity,
          TokenExpiration: rawResponse.data.TokenExpiration,
        };

        callback(loginResult);
      }
    });
  }

  public async LoginWithCustomId(
    customId: string,
    callback: (loginResult: PfLoginResult) => void
  ) {
    let apiEndpoint = this.apiBase + `Client/LoginWithCustomID`;

    const data = {
      TitleId: this.titleId,
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

        // await this.UpdateDisplayName(customId, rawResponse.data.SessionTicket)

        callback(loginResult);
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab login error: ${await response.text()}`);
      }
    });
  }

  public async GetEntityKey(
    entity: EntityTokenResponse,
    sessionToken: string,
    callback: (loginResult: EntityTokenResponse) => void
  ) {
    let apiEndpoint = this.apiBase + `Authentication/GetEntityToken`;

    const data = {
      Entity: entity.Entity,
    };

    await fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": sessionToken,
        "X-EntityToken": `${entity.EntityToken}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
        let rawResponse = await response.json();
        let loginResult: EntityTokenResponse = {
          EntityToken: rawResponse.data.EntityToken,
          Entity: rawResponse.data.Entity,
          TokenExpiration: rawResponse.data.TokenExpiration,
        };

        callback(loginResult);
      }
    });
  }

  private UpdateDisplayName(displayName: string, token: string) {
    let apiEndpoint = this.apiBase + `Client/UpdateUserTitleDisplayName`;

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

  public IncrementStat(entityKey: string, statName: string) {
    const apiEndpoint = this.apiBase + `Client/UpdatePlayerStatistics`;
    const data = {
      Statistics: [
        {
          LeaderboardName: `${statName}`,
          Value: "1",
        },
      ],
    };

    fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": `${entityKey}`,
      },
    }).then(async (response) => {
      if (response.status === 200) {
      } else {
        // tslint:disable-next-line: no-console
        console.log(`playfab stat error: ${await response.text()}`);
      }
    });
  }

  public GetV2Leaderboard(
    entityToken: EntityTokenResponse,
    statName: string,
    callback: (leaderboardResult: PfV2LeaderboardResult) => void
  ) {
    let apiEndpoint = this.apiBase + `Leaderboard/GetLeaderboard`;

    const data = {
      EntityType: "title_player_account",
      LeaderboardName: statName,
      PageSize: 10,
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
    let apiEndpoint = this.apiBase + `Leaderboard/GetLeaderboardAroundEntity`;

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
    statName: string,
    entities: string[],
    callback: (leaderboardResult: PfV2LeaderboardResult) => void
  ) {
    let apiEndpoint = this.apiBase + `Leaderboard/GetLeaderboardForEntities`;

    const data = {
      EntityType: "title_player_account",
      LeaderboardName: statName,
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
}
