import React from "react";
import ReactDOM from "react-dom/client";
import { IconContext } from "react-icons";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import "./index.css";
import { ThemeProvider } from "@infogata/shadcn-vite-theme-provider";
import Router from "./router";
import store, { persistor } from "./store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PluginsProvider } from "./contexts/PluginsContext";
import { ExtensionProvider } from "./contexts/ExtensionContext";
import AnalyticsProvider from "./components/AnalyticsProvider";
import AnalyticsPreference from "./components/AnalyticsPreference";
import AppErrorBoundary from "./components/AppErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* Outermost on purpose: everything below can throw during first render,
        and the router's own error handling only covers routes. */}
    <AppErrorBoundary>
    <AnalyticsProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {/* Inside PersistGate so it acts on the remembered choice rather than
              the default, and inside the provider so there is a client to tell. */}
          <AnalyticsPreference />
          <title>VideoGata</title>
          <ThemeProvider defaultTheme="system">
            <ExtensionProvider>
              <IconContext.Provider value={{ className: "size-5" }}>
                <QueryClientProvider client={queryClient}>
                  <PluginsProvider>
                    <Router />
                  </PluginsProvider>
                </QueryClientProvider>
              </IconContext.Provider>
            </ExtensionProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </AnalyticsProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
