import { SnackbarKey, SnackbarProvider } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientProvider } from "react-query";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import useOffline from "./hooks/useOffline";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";
import MainContainer from "./layouts/MainContriner";
import SideBar from "./layouts/SideBar";
import TopBar from "./layouts/TopBar";
import PluginsProvider from "./providers/PluginsProvider";
import { useAppDispatch } from "./store/hooks";
import { initializePlaylists } from "./store/reducers/playlistReducer";
import { hasExtension } from "./utils";

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
  useUpdateServiceWorker();
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
        <MatomoRouterProvider>
          <PluginsProvider>
            <div className="flex">
              <Toaster closeButton />
              <TopBar />
              <SideBar />
              <MainContainer />
            </div>
          </PluginsProvider>
        </MatomoRouterProvider>
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

export default App;
