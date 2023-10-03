import React, { useEffect, useState } from "react";
import PlayFabClient from "../PlayFab/PlayFabClient";
import { CTable } from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";
import PfLoginResult, {
  EntityTokenResponse,
} from "../PlayFab/models/PfLoginResult";
import PfV2LeaderboardResult, {
  LBV2Ranking,
} from "../PlayFab/models/PfV2LeaderboardResult";

const statName = "HarleyStat";

interface displayTableType {
  rank: number;
  displayName: string;
  col_1: number;
  col_2: number;
  col_3: number;
  col_4: number;
  col_5: number;
}

function Leaderboard() {
  // const [numColumns, setNumColumns] = useState(1);
  const [data, setData] = useState<PfV2LeaderboardResult>();

  useEffect(() => {
    // Prod
    // let pfClient = new PlayFabClient(
    //   "A691C",
    //   "",
    //   true
    // );

    // Matchmaking
    let pfClient = new PlayFabClient("F1098BBF", "", false);

    pfClient.LoginWithCustomId("customId", (loginResult: PfLoginResult) => {
      pfClient.GetEntityKey(
        loginResult.EntityToken,
        loginResult.SessionTicket,
        async (loginResult: EntityTokenResponse) => {
          if (loginResult !== null) {
            pfClient.GetV2Leaderboard(
              loginResult.EntityToken,
              statName,
              (leaderboardResult: PfV2LeaderboardResult) => {
                if (leaderboardResult !== null) {
                  setData(leaderboardResult);
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
        }
      );
    });
  }, []);

  const columns = [
    {
      key: "rank",
      label: "rank",
      _props: { scope: "col" },
    },
    {
      key: "displayName",
      _props: { scope: "col" },
    },
    {
      key: "col_1",
      label: "Score1",
      _props: { scope: "col" },
    },
    // {
    //   key: "col_2",
    //   _props: { scope: "col" },
    // },
    // {
    //   key: "col_3",
    //   _props: { scope: "col" },
    // },
    // {
    //   key: "col_4",
    //   _props: { scope: "col" },
    // },
    // {
    //   key: "col_5",
    //   _props: { scope: "col" },
    // },
    // {
    //   key: "metadata",
    //   _props: { scope: "col" },
    // },
  ];

  let projectedDataItems: displayTableType[] | undefined = data?.Rankings.map(
    (item: LBV2Ranking) => ({
      rank: item.Rank,
      displayName: item.Entity.Id,
      col_1: item.Scores[0],
      col_2: item.Scores[1],
      col_3: item.Scores[2],
      col_4: item.Scores[3],
      col_5: item.Scores[4],
      // metadata: "nothereyet",
      _cellProps: { id: { scope: "row" } },
    })
  );

  return <CTable columns={columns} items={projectedDataItems} striped={true} />;
}

// function Leaderboard() {
//   const [leaderboardData] = useState("taylor");
//   return <h1>this is the Leaderboard</h1>;
// }

export default Leaderboard;
