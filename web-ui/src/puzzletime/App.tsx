/* Router for the PuzzleTime web app, mounted under the /games base path. */
import React from "react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import HubPage from "./hub/HubPage";
import WordlePage from "./wordle/WordlePage";

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
        { path: "*", element: <HubPage /> },
      ],
    },
  ],
  { basename: "/games" }
);

export default function App() {
  return <RouterProvider router={router} />;
}
