import {
  RouterProvider,
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import isElectron from "is-electron";
import React from "react";
import Spinner from "./components/Spinner";
import { Channel, PlaylistInfo } from "./plugintypes";
import { routeTree } from "./routeTree.gen";

const history = isElectron() ? createHashHistory() : createBrowserHistory();
const router = createRouter({ routeTree, history, defaultPendingComponent: Spinner });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface HistoryState {
    playlistInfo?: PlaylistInfo;
    channel?: Channel;
  }
}

const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;