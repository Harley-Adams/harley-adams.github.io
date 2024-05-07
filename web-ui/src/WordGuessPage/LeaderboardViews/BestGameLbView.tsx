import { useEffect, useState } from "react";
import { GetLeaderboard } from "../../PlayFab/PlayFabWrapper";
import {
  EntityLeaderboardEntry,
  GetEntityLeaderboardResponse,
} from "../../PlayFab/modules/PlayFabLeaderboardsModule";
import {
  LeaderboardViewProps,
  TransformMsStringToSeconds,
} from "./LeaderboardView";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRecoilState } from "recoil";
import { loggedInPlayerState } from "../WordleState";

const BestGameLbView: React.FC<LeaderboardViewProps> = ({
  leaderboardName,
  version,
}) => {
  const [leaderboardResult, setLeaderboardResult] =
    useState<GetEntityLeaderboardResponse | null>(null);
  const [player] = useRecoilState(loggedInPlayerState);

  useEffect(() => {
    if (!player) {
      return;
    }

    GetLeaderboard(player.EntityToken, leaderboardName, version).then(
      (result) => {
        setLeaderboardResult(result);
      }
    );
  }, [leaderboardName, version]);

  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));

  if (!leaderboardResult) {
    return <div>Loading...</div>;
  }

  const columns = (
    <TableRow>
      <TableCell>Rank</TableCell>
      <TableCell>EntityId</TableCell>
      <TableCell>Guesses Made</TableCell>
      <TableCell>Time Taken (seconds)</TableCell>
      {!isXSmall ? <TableCell>Wrong Letters</TableCell> : null}
      {!isXSmall ? <TableCell>Misplace Letters</TableCell> : null}
      <TableCell>Answer</TableCell>
    </TableRow>
  );

  let projectedDataItems = leaderboardResult.Rankings.map(
    (item: EntityLeaderboardEntry) => {
      return (
        <TableRow key={item.Rank}>
          <TableCell component="th" scope="row">
            {item.Rank}
          </TableCell>
          <TableCell align="right">
            {item.DisplayName ? item.DisplayName : item.Entity.Id}
          </TableCell>
          <TableCell align="right">{item.Scores[0]}</TableCell>
          <TableCell align="right">{item.Scores[1]}</TableCell>
          {!isXSmall ? <TableCell>{item.Scores[2]}</TableCell> : null}
          {!isXSmall ? <TableCell>{item.Scores[3]}</TableCell> : null}
          <TableCell align="right">{item.Metadata}</TableCell>
        </TableRow>
      );
    }
  );

  return (
    <TableContainer component={Paper}>
      <Table
        stickyHeader
        sx={{ minWidth: 650, width: "100%" }}
        aria-label="simple table"
      >
        <TableHead>{columns}</TableHead>
        <TableBody>{projectedDataItems}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default BestGameLbView;
