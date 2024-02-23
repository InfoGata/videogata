import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./i18n";
import "./index.css";
import store, { persistor } from "./store/store";
import * as Sentry from "@sentry/browser";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { IconContext } from "react-icons";

Sentry.init({
  dsn: "https://df4f8d9465464a48b323e5cf90bc9e4f@app.glitchtip.com/4799",
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HelmetProvider>
          <Helmet>
            <title>VideoGata</title>
          </Helmet>
          <IconContext.Provider value={{ className: "w-5 h-5" }}>
            <RouterProvider router={router} />
          </IconContext.Provider>
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
