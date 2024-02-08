import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkRequest } from "./types";

declare let self: ServiceWorkerGlobalScope;

let communicationPort: MessagePort;
self.addEventListener("message", (event) => {
  if (event.data) {
    if (event.data.type === "SKIP_WAITING") {
      self.skipWaiting();
    }
    if (event.data.type === "PORT_INITIALIZATION") {
      communicationPort = event.ports[0];
    }
  }
});

const extensionNetworkRequest = async (
  input: RequestInfo
): Promise<NetworkRequest> => {
  return new Promise<NetworkRequest>((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = (event) => {
      const data = event.data;
      port1.close();
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.result);
      }
    };
    communicationPort.postMessage({ type: "NETWORK_REQUEST", input }, [port2]);
  });
};

const sendExtensionRequest = async (request: string) => {
  const result = await extensionNetworkRequest(request);
  const response = new Response(result.body, {
    headers: new Headers(result.headers),
    status: result.status,
    statusText: result.statusText,
  });
  return response;
};

const hostSet = new Set<string>();
const handleNetworkRequest = async (request: string) => {
  const url = new URL(request);
  if (hostSet.has(url.host)) {
    try {
      return await sendExtensionRequest(request);
    } catch {
      /* empty */
    }
  }
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const response = await sendExtensionRequest(request);
    // Save host to send subsequent requests
    hostSet.add(url.host);

    return response;
  }
};

self.addEventListener("fetch", (event) => {
  // If hls urls (.m3u8 and .ts) retry request.
  // If fetch fails, use the extension's networkRequest
  // in case it was a cors error.
  const m3u8Regex = /\.m3u8(?:\?|$)/i;
  const tsRegex = /\.ts(?:\?|$)/i;
  if (m3u8Regex.test(event.request.url) || tsRegex.test(event.request.url)) {
    event.respondWith(handleNetworkRequest(event.request.url));
  }
});

precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));
