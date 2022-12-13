import { Box, Button, CssBaseline } from "@mui/material";
import { SnackbarKey, SnackbarProvider } from "notistack";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Routing from "./components/Routing";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";
import { PluginsProvider } from "./PluginsContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { useAppDispatch } from "./store/hooks";
import { initializePlaylists } from "./store/reducers/playlistReducer";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import { VideoMenuProvider } from "./VideoMenuContext";
import { useTranslation } from "react-i18next";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const notistackRef = React.useRef<SnackbarProvider>(null);
  const onClickDismiss = (key: SnackbarKey) => () => {
    notistackRef?.current?.closeSnackbar(key);
  };
  useUpdateServiceWorker(notistackRef.current?.enqueueSnackbar, onClickDismiss);

  React.useEffect(() => {
    dispatch(initializePlaylists());
  }, [dispatch]);

  return (
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={(key) => (
        <Button onClick={onClickDismiss(key)}>{t("dismiss")}</Button>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MatomoRouterProvider>
            <PluginsProvider>
              <VideoMenuProvider>
                <Box sx={{ display: "flex" }}>
                  <CssBaseline />
                  <TopBar />
                  <SideBar />
                  <Routing />
                </Box>
              </VideoMenuProvider>
            </PluginsProvider>
          </MatomoRouterProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

export default App;
