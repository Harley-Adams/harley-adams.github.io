import { useEffect, useState } from "react";
import { GetLeaderboard } from "../../PlayFab/PlayFabWrapper";
import {
  EntityLeaderboardEntry,
  GetEntityLeaderboardResponse,
} from "../../PlayFab/modules/PlayFabLeaderboardsModule";
import { useRecoilState } from "recoil";
import { loggedInPlayerState } from "../WordleState";
import {
  useMediaQuery,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
  useTheme,
} from "@mui/material";
import React from "react";

export enum LeaderboardName {
  WordleBestGame = "WordleBestGame",
  WordleTopPlayers = "WordleTopPlayers",
}

export enum LeaderboardTimeFrame {
  AllTime = "AllTime",
  Daily = "Daily",
}

export interface LeaderboardViewProps {
  leaderboardName: LeaderboardName;
  timeframe: LeaderboardTimeFrame;
  version?: number;
}

export function TransformMsStringToSeconds(msString: string): string {
  const ms: number = parseInt(msString);
  return (ms / 1000).toFixed(2);
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboardName,
  timeframe,
  version,
}) => {
  const [leaderboardResult, setLeaderboardResult] =
    useState<GetEntityLeaderboardResponse | null>(null);
  const [player] = useRecoilState(loggedInPlayerState);

  useEffect(() => {
    if (!player) {
      return;
    }

    let leaderboardPlayFabName: string = leaderboardName;
    if (timeframe && timeframe !== LeaderboardTimeFrame.AllTime) {
      leaderboardPlayFabName += timeframe;
    }

    GetLeaderboard(player.EntityToken, leaderboardPlayFabName, version).then(
      (result) => {
        setLeaderboardResult(result);
      }
    );
  }, [leaderboardName, timeframe, version]);

  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));

  if (!leaderboardResult) {
    return <div>Loading...</div>;
  }

  let columns;
  let projectedDataItems;
  if (leaderboardName === "WordleBestGame") {
    columns = getBestGameColumns(isXSmall);
    projectedDataItems = getBestGameRows(isXSmall, leaderboardResult.Rankings);
  } else {
    columns = getTopPlayersColumns(isXSmall);
    projectedDataItems = getTopPlayersRows(
      isXSmall,
      leaderboardResult.Rankings
    );
  }

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

function getBestGameColumns(isXSmall: boolean) {
  return (
    <TableRow>
      <TableCell>Rank</TableCell>
      <TableCell>EntityId</TableCell>
      <TableCell>Guesses Made</TableCell>
      <TableCell>Time Taken (seconds)</TableCell>
      {!isXSmall && <TableCell>Wrong Letters</TableCell>}
      {!isXSmall && <TableCell>Misplace Letters</TableCell>}
      <TableCell>Answer</TableCell>
    </TableRow>
  );
}

function getBestGameRows(
  isXSmall: boolean,
  leaderboardRankings: EntityLeaderboardEntry[]
) {
  return leaderboardRankings.map((item: EntityLeaderboardEntry) => {
    return (
      <TableRow key={item.Rank}>
        <TableCell component="th" scope="row">
          {item.Rank}
        </TableCell>
        <TableCell align="right">
          {item.DisplayName ? item.DisplayName : item.Entity.Id}
        </TableCell>
        <TableCell align="right">{item.Scores[0]}</TableCell>
        <TableCell align="right">
          {TransformMsStringToSeconds(item.Scores[1])}
        </TableCell>
        {!isXSmall ? <TableCell>{item.Scores[2]}</TableCell> : null}
        {!isXSmall ? <TableCell>{item.Scores[3]}</TableCell> : null}
        <TableCell align="right">{item.Metadata}</TableCell>
      </TableRow>
    );
  });
}

function getTopPlayersColumns(isXSmall: boolean) {
  return (
    <TableRow>
      <TableCell>Rank</TableCell>
      <TableCell>EntityId</TableCell>
      <TableCell>Puzzles Solved</TableCell>
      <TableCell>Guesses Made</TableCell>
      <TableCell>Time Played (seconds)</TableCell>
      {!isXSmall && <TableCell>Wrong Letters</TableCell>}
      {!isXSmall && <TableCell>Misplace Letters</TableCell>}
    </TableRow>
  );
}

function getTopPlayersRows(
  isXSmall: boolean,
  leaderboardRankings: EntityLeaderboardEntry[]
) {
  return leaderboardRankings.map((item: EntityLeaderboardEntry) => {
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
        {!isXSmall ? (
          <TableCell>{TransformMsStringToSeconds(item.Scores[2])}</TableCell>
        ) : null}
        {!isXSmall ? <TableCell>{item.Scores[3]}</TableCell> : null}
        {!isXSmall ? <TableCell>{item.Scores[4]}</TableCell> : null}
      </TableRow>
    );
  });
}
