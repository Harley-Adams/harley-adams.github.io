import React, { useState, ChangeEvent } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  SelectChangeEvent,
} from "@mui/material";
import {
  LeaderboardName,
  LeaderboardTimeFrame,
  LeaderboardView,
} from "../WordGuessPage/LeaderboardViews/LeaderboardView";

const LeaderboardModal: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [leaderboardName, setLeaderboardName] = useState<LeaderboardName>(
    LeaderboardName.WordleBestGame
  );
  const [timeframe, setTimeframe] = useState<LeaderboardTimeFrame>(
    LeaderboardTimeFrame.AllTime
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLeaderboardChange = (event: SelectChangeEvent<string>) => {
    setLeaderboardName(event.target.value as LeaderboardName);
  };

  const handleTimeframeChange = (event: SelectChangeEvent<string>) => {
    setTimeframe(event.target.value as LeaderboardTimeFrame);
  };

  return (
    <Grid sx={{ minWidth: "48%", margin: "4px" }}>
      <Button
        size="small"
        variant="outlined"
        color="secondary"
        sx={{ minWidth: "48%", margin: "4px" }}
        onClick={handleClickOpen}
      >
        View Leaderboards
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Leaderboards</DialogTitle>
        <DialogContent style={{ paddingTop: 5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="leaderboard-label">Leaderboard Name</InputLabel>
                <Select
                  labelId="leaderboard-label"
                  id="leaderboard-select"
                  value={leaderboardName}
                  label="Leaderboard Name"
                  onChange={handleLeaderboardChange}
                >
                  {Object.keys(LeaderboardName).map((key) => (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="timeframe-label">Timeframe</InputLabel>
                <Select
                  labelId="timeframe-label"
                  id="timeframe-select"
                  value={timeframe}
                  label="Timeframe"
                  onChange={handleTimeframeChange}
                >
                  {Object.keys(LeaderboardTimeFrame).map((key) => (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <LeaderboardView
            leaderboardName={leaderboardName}
            timeframe={timeframe}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default LeaderboardModal;
