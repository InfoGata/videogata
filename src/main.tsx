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
import Router from "./router";
import store, { persistor } from "./store/store";
import { QueryClient, QueryClientProvider } from "react-query";
import PluginsProvider from "./providers/PluginsProvider";
import { ExtensionProvider } from "./contexts/ExtensionContext";
import { PostHogProvider } from "posthog-js/react";

Sentry.init({
  dsn: "https://df4f8d9465464a48b323e5cf90bc9e4f@app.glitchtip.com/4799",
});

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
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true,
        debug: import.meta.env.MODE === "development",
        cookieless_mode: "always"
      }}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <HelmetProvider>
            <Helmet>
              <title>VideoGata</title>
            </Helmet>
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
          </HelmetProvider>
        </PersistGate>
      </Provider>
    </PostHogProvider>
  </React.StrictMode>
);
