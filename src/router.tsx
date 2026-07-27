import {
  RouterProvider,
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import isElectron from "is-electron";
import React from "react";
import Spinner from "./components/Spinner";
import { db } from "./database";
import { setPluginAliases } from "./lib/plugin-alias";
import { Channel, PlaylistInfo } from "./plugintypes";
import { routeTree } from "./routeTree.gen";

const history = isElectron() ? createHashHistory() : createBrowserHistory();
const router = createRouter({ routeTree, history, defaultPendingComponent: Spinner });
export type RouterType = typeof router;

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
  // Routes translate the alias in the url to a plugin id in params.parse, which
  // the router calls once per match and never re-runs. Prime the registry from
  // stored plugin metadata before rendering, or a cold load of /s/<alias>/...
  // would resolve to nothing. This is only an IndexedDB read: plugin frames go
  // on loading in the background as before.
  const [aliasesLoaded, setAliasesLoaded] = React.useState(false);

  React.useEffect(() => {
    const loadAliases = async () => {
      try {
        setPluginAliases(await db.plugins.toArray());
      } catch (e) {
        console.error("Failed to load plugin aliases:", e);
      } finally {
        setAliasesLoaded(true);
      }
    };
    loadAliases();
  }, []);

  if (!aliasesLoaded) return <Spinner open={true} />;

  return <RouterProvider router={router} />;
};

export default Router;