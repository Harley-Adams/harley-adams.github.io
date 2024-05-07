import React, { useEffect, useState } from "react";
import { PlayFabMultiplayerModels } from "../PlayFab/modules/PlayFabMultiplayerModule";
import { GetLobbies, LeaveLobby } from "../PlayFab/PlayFabWrapper";
import {
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
} from "@mui/material";
import { useRecoilState } from "recoil";
import { loggedInPlayerState } from "../WordGuessPage/WordleState";

interface GameFinderProps {
  onJoinLobby: (connectionString: string) => void;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const GameFinder: React.FC<GameFinderProps> = ({ onJoinLobby }) => {
  const [player] = useRecoilState(loggedInPlayerState);
  const [open, setOpen] = useState(true);
  const [isLoadingLobbies, setIsLoadingLobbies] = useState<boolean>(true);
  const [lobbies, setLobbies] = useState<
    PlayFabMultiplayerModels.LobbySummary[]
  >([]);

  useEffect(() => {
    if (!player) {
      setIsLoadingLobbies(false);
      setOpen(false);
      return;
    }

    GetLobbies(player.EntityToken)
      .then((lobbiesLocal) => {
        if (lobbiesLocal && lobbiesLocal.Lobbies.length > 0) {
          setLobbies(lobbiesLocal.Lobbies);
        }
      })
      .finally(() => {
        setIsLoadingLobbies(false);
      });
  }, [player]);

  const handleClose = () => setOpen(false);

  const handleLeaveLobby = async (lobbyId: string) => {
    if (player) {
      await LeaveLobby(player.EntityToken, lobbyId);
    }
  };

  if (isLoadingLobbies) {
    return <CircularProgress />;
  }
  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {isLoadingLobbies && <CircularProgress />}
          {lobbies.length === 0 && <NoLobbiesFoundView />}
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Lobby ID</TableCell>
                <TableCell align="right">Players</TableCell>
                <TableCell align="right">Owner ID</TableCell>
                <TableCell align="right">Join</TableCell>
                <TableCell align="right">Leave</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lobbies.map((lobby, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {lobby.LobbyId}
                  </TableCell>
                  <TableCell align="right">
                    {lobby.CurrentPlayers} / {lobby.MaxPlayers}
                  </TableCell>
                  <TableCell align="right">{lobby.Owner?.Id}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => onJoinLobby(lobby.ConnectionString)}
                    >
                      Join Lobby
                    </Button>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleLeaveLobby(lobby.LobbyId)}
                    >
                      Leave
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Modal>
    </div>
  );
};

const NoLobbiesFoundView: React.FC = () => {
  return <div> No lobbies found.</div>;
};

export default GameFinder;
