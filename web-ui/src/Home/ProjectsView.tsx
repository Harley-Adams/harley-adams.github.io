import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import runBoxRunImg from "../images/runboxrun.png";
import wordleRoyaleImg from "../images/wordleroyale.png";
import wordleImg from "../images/wordle.png";
import { Link as RouterLink } from "react-router-dom";

const items = [
  {
    icon: <div />,
    title: "Totally Not Wordle",
    description: `Inspired by Josh Wardle's viral 'Wordle' puzzle game from 2021.
      Includes live service" features such as stat tracking and
      leaderboards via PlayFab.`,
    link: "/WordGuessGame",
    imageLight: "url(" + wordleImg + ")",
    imageDark: "url(" + wordleImg + ")",
  },
  {
    icon: <div />,
    title: "Totally Not Wordle, Battle Royale Edition",
    description: `Taking my wordle clone one step further, I updated the game to be multiplayer! 
    Players can join a lobby and compete against each other to see who can guess the word first. 
    Multiplayer functionality is powered by PlayFab.`,
    link: "/MultiplayerGames",
    imageLight: "url(" + wordleRoyaleImg + ")",
    imageDark: "url(" + wordleRoyaleImg + ")",
  },
  {
    icon: <div />,
    title: "Run Box Run",
    description: `Android game published on the Google Play store
      During my time at University, I created an android game called Run Box Run. 
      I made it without using any frameworks or libraries besides from built in Java and Android functionality. 
      Unfortunately I didn't maintain my google play account, so RunBoxRun is no longer available on the app store :(.`,
    // link: "/WordGuessGame",
    imageLight: "url(" + runBoxRunImg + ")",
    imageDark: "url(" + runBoxRunImg + ")",
  },
];

export default function ProjectsView() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
  };

  const selectedFeature = items[selectedItemIndex];

  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <div>
            <Typography component="h2" variant="h4" color="text.primary">
              Personal Projects
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: { xs: 2, sm: 4 } }}
            >
              These are some projects I've worked on in my own time, either for
              fun or for learning new tech.
            </Typography>
          </div>
          <Grid
            container
            item
            gap={1}
            sx={{ display: { xs: "auto", sm: "none" } }}
          >
            {items.map(({ title, link }, index) => (
              <Chip
                key={index}
                label={title}
                onClick={() => handleItemClick(index)}
                sx={{
                  borderColor: (theme) => {
                    if (theme.palette.mode === "light") {
                      return selectedItemIndex === index ? "primary.light" : "";
                    }
                    return selectedItemIndex === index ? "primary.light" : "";
                  },
                  background: (theme) => {
                    if (theme.palette.mode === "light") {
                      return selectedItemIndex === index ? "none" : "";
                    }
                    return selectedItemIndex === index ? "none" : "";
                  },
                  backgroundColor:
                    selectedItemIndex === index ? "primary.main" : "",
                  "& .MuiChip-label": {
                    color: selectedItemIndex === index ? "#fff" : "",
                  },
                }}
              />
            ))}
          </Grid>
          <Box
            component={Card}
            variant="outlined"
            sx={{
              display: { xs: "auto", sm: "none" },
              mt: 4,
            }}
          >
            <Box
              sx={{
                backgroundImage: (theme) =>
                  theme.palette.mode === "light"
                    ? items[selectedItemIndex].imageLight
                    : items[selectedItemIndex].imageDark,
                backgroundSize: "contain",
                backgroundPosition: "center",
                minHeight: 280,
                backgroundRepeat: "no-repeat",
                width: "100%",
              }}
            />
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography
                color="text.primary"
                variant="body2"
                fontWeight="bold"
              >
                {selectedFeature.title}
              </Typography>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ my: 0.5 }}
              >
                {selectedFeature.description}
              </Typography>
              {selectedFeature.link ? (
                <Link
                  color="primary"
                  variant="body2"
                  fontWeight="bold"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    "& > svg": { transition: "0.2s" },
                    "&:hover > svg": { transform: "translateX(2px)" },
                  }}
                  component={RouterLink}
                  to={selectedFeature.link}
                >
                  <span>Try it out!</span>
                  <ChevronRightRoundedIcon
                    fontSize="small"
                    sx={{ mt: "1px", ml: "2px" }}
                  />
                </Link>
              ) : null}
            </Box>
          </Box>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={2}
            useFlexGap
            sx={{ width: "100%", display: { xs: "none", sm: "flex" } }}
          >
            {items.map(({ icon, title, description, link }, index) => (
              <Card
                key={index}
                variant="outlined"
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={{
                  p: 3,
                  height: "fit-content",
                  width: "100%",
                  background: "none",
                  backgroundColor:
                    selectedItemIndex === index ? "action.selected" : undefined,
                  borderColor: (theme) => {
                    if (theme.palette.mode === "light") {
                      return selectedItemIndex === index
                        ? "primary.light"
                        : "grey.200";
                    }
                    return selectedItemIndex === index
                      ? "primary.dark"
                      : "grey.800";
                  },
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    textAlign: "left",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { md: "center" },
                    gap: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      color: (theme) => {
                        if (theme.palette.mode === "light") {
                          return selectedItemIndex === index
                            ? "primary.main"
                            : "grey.300";
                        }
                        return selectedItemIndex === index
                          ? "primary.main"
                          : "grey.700";
                      },
                    }}
                  >
                    {icon}
                  </Box>
                  <Box sx={{ textTransform: "none" }}>
                    <Typography
                      color="text.primary"
                      variant="body2"
                      fontWeight="bold"
                    >
                      {title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{ my: 0.5 }}
                    >
                      {description}
                    </Typography>
                    {link ? (
                      <Link
                        color="primary"
                        variant="body2"
                        fontWeight="bold"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          "& > svg": { transition: "0.2s" },
                          "&:hover > svg": { transform: "translateX(2px)" },
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                        component={RouterLink}
                        to={link}
                      >
                        <span>Try it out!</span>
                        <ChevronRightRoundedIcon
                          fontSize="small"
                          sx={{ mt: "1px", ml: "2px" }}
                        />
                      </Link>
                    ) : null}
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: { xs: "none", sm: "flex" }, width: "100%" }}
        >
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              width: "100%",
              display: { xs: "none", sm: "flex" },
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                m: "auto",
                width: "100%",
                height: 500,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundImage: (theme) =>
                  theme.palette.mode === "light"
                    ? items[selectedItemIndex].imageLight
                    : items[selectedItemIndex].imageDark,
                backgroundRepeat: "no-repeat",
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
