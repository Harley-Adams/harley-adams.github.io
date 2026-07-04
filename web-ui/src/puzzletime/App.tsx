/* Router for the PuzzleTime web app, mounted under the /games base path. */
import React from "react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import HubPage from "./hub/HubPage";
import WordlePage from "./wordle/WordlePage";
import VersusPage from "./wordle/versus/VersusPage";
import LeaderboardPage from "./leaderboard/LeaderboardPage";

function Shell() {
  return (
    <div className="pt-app">
      <div className="pt-app-col">
        <Outlet />
      </div>
    </div>
  );
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Shell />,
      children: [
        { index: true, element: <HubPage /> },
        { path: "wordle", element: <WordlePage mode="random" /> },
        { path: "wordle/daily", element: <WordlePage mode="daily" /> },
        { path: "versus", element: <VersusPage /> },
        { path: "leaderboard", element: <LeaderboardPage /> },
        { path: "*", element: <HubPage /> },
      ],
    },
  ],
  { basename: "/games" }
);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
