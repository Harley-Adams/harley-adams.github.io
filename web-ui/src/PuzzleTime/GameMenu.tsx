import {
  useMediaQuery,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Grid,
} from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import { useState } from "react";
import GameFinder from "./GameFinder";
import LoginModal from "./LoginModal";

interface Game {
  title: string;
  description: string;
  singlePlayerAction: () => void;
  multiplayerAction?: () => void;
}

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { title, description } = game;
  const theme: Theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      raised
      sx={{
        maxWidth: 345,
        m: 2,
        transition: "transform 0.3s ease-in-out",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
        },
      }}
    >
      <CardContent>
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          sx={{ fontWeight: "bold" }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions
        sx={{
          justifyContent: "space-around",
          flexWrap: "wrap",
          padding: "8px",
        }}
      >
        <Button
          size="small"
          variant="contained"
          color="primary"
          sx={{ minWidth: "48%", margin: "4px" }}
          onClick={game.singlePlayerAction}
        >
          {isSmallScreen ? "SP" : "Single Player"}
        </Button>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          sx={{ minWidth: "48%", margin: "4px" }}
          onClick={game.multiplayerAction}
        >
          {isSmallScreen ? "MP" : "Multiplayer"}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          sx={{ minWidth: "48%", margin: "4px" }}
        >
          {isSmallScreen ? "Stats" : "View Stats"}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          sx={{ minWidth: "48%", margin: "4px" }}
        >
          {isSmallScreen ? "Leaderboards" : "View Leaderboards"}
        </Button>
      </CardActions>
    </Card>
  );
};

interface GameMenuProps {
  setGameStart: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = (props) => {
  const [showGameFinder, setShowGameFinder] = useState<boolean>(false);

  const games: Game[] = [
    {
      title: "Not Wordle",
      description: `Guess the word, each guess reveals which 
          letters are in the correct space, wrong space, or not used at all.`,
      singlePlayerAction: props.setGameStart,
      multiplayerAction: () => {
        setShowGameFinder(true);
      },
    },
    {
      title: "My next game",
      description: ``,
      singlePlayerAction: props.setGameStart,
    },
    {
      title: "The one after that",
      description: ``,
      singlePlayerAction: props.setGameStart,
    },
    // {
    //   title: "Math Mapper",
    //   description: `Test your math skills by using a set of numbers to form an equation to calculate the answer.`,
    //   singlePlayerLink: "/",
    // },
    // {
    //   title: "Atlas Guesser",
    //   description: `Guess the country based on the silhouette.`,
    // },
    // Add more games as needed
  ];

  return (
    <div>
      {showGameFinder && (
        <GameFinder
          onJoinLobby={function (connectionString: string): void {
            throw new Error("Function not implemented.");
          }}
        />
      )}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start", // Adjusts position to be higher up
          alignItems: "center",
          minHeight: "100vh", // Ensures full height
          pt: 8, // Adds padding at the top
          pb: 3, // Padding bottom
          background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "600", // Bolder weight
            color: "primary.secondary", // Theme-based primary color
            textShadow: "1px 1px 2px black", // Text shadow for 'pop'
          }}
        >
          Puzzle Time
        </Typography>

        <LoginModal />

        <Grid container spacing={2} display="flex" justifyContent="center">
          {games.map((game, index) => (
            <Grid
              item
              key={index}
              xs={12}
              sm={6}
              md={4}
              display="flex"
              justifyContent="center"
              flexBasis="auto"
            >
              <GameCard game={game} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </div>
  );
};
