import { CTable } from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";
import { LBV2Ranking } from "../PlayFab/models/PfV2LeaderboardResult";

export interface LeaderboardTableRow {
  rank: number;
  displayName: string;
  col_1: number;
  col_2: number;
  col_3: number;
  col_4: number;
  col_5: number;
  metadata: string;
}

interface Props {
  rankings: LBV2Ranking[];
}

function LeaderboardTable(props: Props) {
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

  let projectedDataItems = props.rankings.map((item: LBV2Ranking) => ({
    rank: item.Rank,
    displayName: item.Entity.Id,
    col_1: item.Scores[0],
    col_2: item.Scores[1],
    col_3: item.Scores[2],
    col_4: item.Scores[3],
    col_5: item.Scores[4],
    metadata: "nothereyet",
    _cellProps: { id: { scope: "row" } },
  }));

  return (
    <div>
      <CTable columns={columns} items={projectedDataItems} striped={true} />
    </div>
  );
}

export default LeaderboardTable;
