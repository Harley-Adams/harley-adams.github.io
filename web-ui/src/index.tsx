import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Leaderboard from "./LeaderboardPage/Leaderboard";
import Layout from "./Layout";
import Profile from "./ProfilePage/Profile";
import MarkdownHost from "./Blog/MarkdownHost";
import FivePM from "./FivePMPage/FivePM";
import Crossword from "./Crossword/Crossword";
import WordGuessPage from "./WordGuessPage/WordGuessPage";
import LobbyPage from "./LobbyPage/LobbyPage";
import { ToastContainer } from "react-toastify";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Profile />,
      },
      {
        path: "/Leaderboard",
        element: <Leaderboard />,
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
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ToastContainer />
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
