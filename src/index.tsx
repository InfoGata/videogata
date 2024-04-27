import * as Sentry from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom/client";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { IconContext } from "react-icons";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import "./index.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import store, { persistor } from "./store/store";
import {
  RouterProvider,
  createBrowserHistory,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { Channel, PlaylistInfo } from "./plugintypes";
import isElectron from "is-electron";

Sentry.init({
  dsn: "https://df4f8d9465464a48b323e5cf90bc9e4f@app.glitchtip.com/4799",
});

const history = isElectron() ? createHashHistory() : createBrowserHistory();
const router = createRouter({ routeTree, history });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface HistoryState {
    playlistInfo?: PlaylistInfo;
    channel?: Channel;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HelmetProvider>
          <Helmet>
            <title>VideoGata</title>
          </Helmet>
          <ThemeProvider defaultTheme="system">
            <IconContext.Provider value={{ className: "w-5 h-5" }}>
              <RouterProvider router={router} />
            </IconContext.Provider>
          </ThemeProvider>
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
