import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Outlet } from "react-router-dom";
import MatomoRouterProvider from "./components/MatomoRouterProvider";
import MiniPlayer from "./components/MiniPlayer";
import { Toaster } from "./components/ui/sonner";
import useOffline from "./hooks/useOffline";
import useUpdateServiceWorker from "./hooks/useUpdateServiceWorker";
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
  const dispatch = useAppDispatch();
  useUpdateServiceWorker();
  useOffline();

  React.useEffect(() => {
    dispatch(initializePlaylists());
  }, [dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <MatomoRouterProvider>
        <PluginsProvider>
          <TopBar />
          <div className="flex h-screen overflow-hidden">
            <Toaster closeButton />
            <SideBar />
            <main className="pt-20 flex-1 pl-6 overflow-auto pb-1">
              <MiniPlayer />
              <Outlet />
            </main>
          </div>
        </PluginsProvider>
      </MatomoRouterProvider>
    </QueryClientProvider>
  );
};

export default App;
