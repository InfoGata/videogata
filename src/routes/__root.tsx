import { Outlet, createRootRoute } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";
import MiniPlayer from "../components/MiniPlayer";
import { Toaster } from "../components/ui/sonner";
import useOffline from "../hooks/useOffline";
import useUpdateServiceWorker from "../hooks/useUpdateServiceWorker";
import SideBar from "../layouts/SideBar";
import TopBar from "../layouts/TopBar";
import { useAppDispatch } from "../store/hooks";
import { initializePlaylists } from "../store/reducers/playlistReducer";
import { hasExtension } from "../utils";

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
    if (hasExtension() && window.InfoGata?.networkRequest) {
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

export const Root: React.FC = () => {
  const dispatch = useAppDispatch();
  useUpdateServiceWorker();
  useOffline();

  React.useEffect(() => {
    dispatch(initializePlaylists());
  }, [dispatch]);

  return (
    <>
      <TopBar />
      <div className="flex h-screen overflow-hidden">
        <Toaster closeButton />
        <SideBar />
        <main className="pt-20 flex-1 pl-2 overflow-auto pb-1">
          <MiniPlayer />
          <Outlet />
        </main>
      </div>
    </>
  );
};

const rootSearchSchema = z.object({
  time: z.number().optional().catch(undefined),
});

export const Route = createRootRoute({
  component: Root,
  validateSearch: rootSearchSchema,
});
