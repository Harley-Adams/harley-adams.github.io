import {
  Box,
  Button,
  CssBaseline,
  PaletteMode,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import JobsView from "./JobsView";
import GetTheme from "../GetTheme";
import React from "react";
import AppAppBar from "./AppAppBar";
import ToggleColorMode from "./ToggleColorMode";
import ProjectsView from "./ProjectsView";
import HeroView from "./HeroView";

export const HomePage: React.FC = () => {
  const [mode, setMode] = React.useState<PaletteMode>("light");
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const LPtheme = createTheme(GetTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };

  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
      <CssBaseline />
      {/* <AppAppBar mode={mode} toggleColorMode={toggleColorMode} /> */}
      <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />

      {/* <Hero /> */}
      <Box sx={{ bgcolor: "background.default" }}>
        <HeroView />
        <ProjectsView />
        <JobsView />
      </Box>
    </ThemeProvider>
  );
};
