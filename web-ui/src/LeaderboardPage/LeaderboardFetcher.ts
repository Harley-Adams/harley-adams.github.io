import PlayFabClient from "../PlayFab/PlayFabClient";
import PfLoginResult from "../PlayFab/models/PfLoginResult";
import PfV2LeaderboardResult from "../PlayFab/models/PfV2LeaderboardResult";

export function GetTopNLeaderboard(
  pfClient: PlayFabClient,
  statName: string,
  callback: (leaderboardResult: PfV2LeaderboardResult) => void
) {
  pfClient.LoginWithCustomId("customId", (loginResult: PfLoginResult) => {
    if (loginResult !== null) {
      pfClient.GetV2Leaderboard(
        loginResult.EntityToken.EntityToken,
        statName,
        (leaderboardResult: PfV2LeaderboardResult) => {
          if (leaderboardResult !== null) {
            callback(leaderboardResult);
          } else {
            // tslint:disable-next-line: no-console
            console.log(`playfab getleaderboards error}`);
          }
        }
      );
    } else {
      // tslint:disable-next-line: no-console
      console.log(`playfab login error}`);
    }
  });
}

export function GetLeaderboardAroundEntity(
  pfClient: PlayFabClient,
  statName: string,
  callback: (leaderboardResult: PfV2LeaderboardResult) => void
) {
  pfClient.LoginWithCustomId("customId", (loginResult: PfLoginResult) => {
    if (loginResult !== null) {
      pfClient.GetV2LeaderboardAroundPlayer(
        loginResult.EntityToken.EntityToken,
        statName,
        (leaderboardResult: PfV2LeaderboardResult) => {
          if (leaderboardResult !== null) {
            callback(leaderboardResult);
          } else {
            // tslint:disable-next-line: no-console
            console.log(`playfab getleaderboards error}`);
          }
        }
      );
    } else {
      // tslint:disable-next-line: no-console
      console.log(`playfab login error}`);
    }
  });
}
