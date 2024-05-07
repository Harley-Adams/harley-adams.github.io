import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Grid,
} from "@mui/material";
import { GetStatistics } from "../../PlayFab/PlayFabWrapper";
import {
  GetStatisticsResponse,
  Statistic,
} from "../../PlayFab/modules/PlayFabLeaderboardsModule";
import { useRecoilState } from "recoil";
import { loggedInPlayerState } from "../WordleState";

const StatisticsView: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [statisticsResult, setStatisticsResult] =
    useState<GetStatisticsResponse | null>(null);
  const [player] = useRecoilState(loggedInPlayerState);

  useEffect(() => {
    if (open && player) {
      // Only fetch statistics when the modal is opened
      GetStatistics(player.EntityToken).then((statsResponse) => {
        setStatisticsResult(statsResponse);
      });
    }
  }, [player, open]); // Add `open` to the dependency array to refetch when reopened

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const columns = [
    { key: "statName", label: "Statistic Name" },
    { key: "version", label: "Version" },
    { key: "col_1", label: "Score1" },
    { key: "col_2", label: "Score2" },
    { key: "col_3", label: "Score3" },
    { key: "col_4", label: "Score4" },
    { key: "col_5", label: "Score5" },
    { key: "metadata", label: "Metadata" },
  ];

  const projectedDataItems = statisticsResult
    ? Object.entries(statisticsResult.Statistics).map(
        ([statName, stat]: [string, Statistic]) => ({
          statName,
          version: stat.Version ?? "0",
          col_1: stat.Scores[0] ?? "",
          col_2: stat.Scores[1] ?? "",
          col_3: stat.Scores[2] ?? "",
          col_4: stat.Scores[3] ?? "",
          col_5: stat.Scores[4] ?? "",
          metadata: stat.Metadata ?? "",
        })
      )
    : [];

  return (
    <Grid sx={{ minWidth: "48%", margin: "4px" }}>
      <Button
        size="small"
        variant="outlined"
        color="primary"
        onClick={handleOpen}
        sx={{ minWidth: "100%" }}
      >
        View Statistics
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>Player Statistics</DialogTitle>
        <DialogContent>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {projectedDataItems.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {item[column.key as keyof typeof item]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </Dialog>
    </Grid>
  );
};

export default StatisticsView;
