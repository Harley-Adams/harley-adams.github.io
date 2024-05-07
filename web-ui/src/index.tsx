import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import Profile from "./ProfilePage/Profile";
import MarkdownHost from "./Blog/MarkdownHost";
import FivePM from "./FivePMPage/FivePM";
import Crossword from "./Crossword/Crossword";
import WordGuessPage from "./WordGuessPage/WordGuessPage";
import LobbyPage from "./LobbyPage/LobbyPage";
import { RecoilRoot } from "recoil";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline } from "@mui/material";
import { HomePage } from "./Home/HomePage";
import { PuzzleTimePage } from "./PuzzleTime/PuzzleTimePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/Profile",
        element: <Profile />,
      },
      {
        path: "/Crossword",
        element: <Crossword />,
      },
      {
        path: "/FivePM",
        element: <FivePM />,
      },
      {
        path: "/Posts",
        element: <MarkdownHost />,
      },
      {
        path: "/WordGuessGame",
        element: <WordGuessPage />,
      },
      {
        path: "/MultiplayerGames",
        element: <LobbyPage />,
      },
      {
        path: "/PuzzleTime",
        element: <PuzzleTimePage />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <CssBaseline enableColorScheme />
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
