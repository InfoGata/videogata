import { Box, Button, CssBaseline } from "@mui/material";
import isElectron from "is-electron";
import { SnackbarKey, SnackbarProvider } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, HashRouter } from "react-router-dom";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import Routing from "./components/Routing";
import SideBar from "./layouts/SideBar";
import TopBar from "./layouts/TopBar";
import useOffline from "./hooks/useOffline";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";
import ItemMenuProvider from "./providers/ItemMenuProvider";
import PluginsProvider from "./providers/PluginsProvider";
import VideoMenuProvider from "./providers/VideoMenuProvider";
import { useAppDispatch } from "./store/hooks";
import { initializePlaylists } from "./store/reducers/playlistReducer";
import { hasExtension } from "./utils";

const Router = isElectron() ? HashRouter : BrowserRouter;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const messageChannel = new MessageChannel();
navigator.serviceWorker?.ready.then((registration) => {
  registration.active?.postMessage(
    {
      type: "PORT_INITIALIZATION",
    },
    [messageChannel.port2]
  );
});

messageChannel.port1.onmessage = async (event) => {
  if (event.data && event.data.type === "NETWORK_REQUEST") {
    const port = event.ports[0];
    if (hasExtension()) {
      try {
        const input = event.data.input;
        const response = await window.InfoGata.networkRequest(input);
        port.postMessage({ result: response });
      } catch {
        port.postMessage({ error: "Error sending request" });
      }
    } else {
      port.postMessage({ error: "Extension not installed" });
    }
  }
};

const App: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const notistackRef = React.useRef<SnackbarProvider>(null);
  const onClickDismiss = (key: SnackbarKey) => {
    notistackRef?.current?.closeSnackbar(key);
  };
  useUpdateServiceWorker(notistackRef.current?.enqueueSnackbar, onClickDismiss);
  useOffline(notistackRef.current?.enqueueSnackbar, onClickDismiss);

  React.useEffect(() => {
    dispatch(initializePlaylists());
  }, [dispatch]);

  return (
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={(key) => (
        <Button onClick={() => onClickDismiss(key)}>{t("dismiss")}</Button>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <MatomoRouterProvider>
            <PluginsProvider>
              <VideoMenuProvider>
                <ItemMenuProvider>
                  <Box sx={{ display: "flex" }}>
                    <CssBaseline />
                    <TopBar />
                    <SideBar />
                    <Routing />
                  </Box>
                </ItemMenuProvider>
              </VideoMenuProvider>
            </PluginsProvider>
          </MatomoRouterProvider>
        </Router>
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

export default App;
