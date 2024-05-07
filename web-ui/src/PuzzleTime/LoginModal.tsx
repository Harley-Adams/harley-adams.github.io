import React, { useState } from "react";
import { Button, TextField, Modal, Box, Typography } from "@mui/material";
import { useRecoilState } from "recoil";
import {
  customIdState,
  loggedInPlayerState,
} from "../WordGuessPage/WordleState";
import { loginWithCustomId } from "../PlayFab/PlayFabWrapper";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const LoginModal: React.FC = () => {
  const [loggedInPlayer, setLoggedInPlayer] =
    useRecoilState(loggedInPlayerState);
  const [customIdInput, setCustomIdInput] = useRecoilState(customIdState);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCustomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomIdInput(event.target.value);
  };

  const handleLogin = async () => {
    const loginResponse = await loginWithCustomId(customIdInput);
    if (loginResponse) {
      setLoggedInPlayer(loginResponse);
      handleClose(); // Close the modal on successful login
    }
  };

  const buttonStyle = {
    bgcolor: "orange", // Bright background color for high contrast
    color: "white", // White text for better readability
    "&:hover": {
      bgcolor: "darkorange", // Darker orange on hover for visual feedback
      boxShadow: "0px 0px 8px #fff", // Adding a light shadow effect on hover
    },
  };

  // If already logged in don't show the login button or modal.
  if (loggedInPlayer) {
    return null;
  }

  return (
    <div>
      <Button onClick={handleOpen} sx={buttonStyle}>
        Login to PlayFab
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Login to PlayFab
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Provide any custom id:
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Custom ID"
            value={customIdInput}
            onChange={handleCustomIdChange}
            sx={{ mt: 1, mb: 2 }}
          />
          <Button variant="contained" onClick={handleLogin}>
            Login
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default LoginModal;
