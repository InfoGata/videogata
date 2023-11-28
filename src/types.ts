import {
  Channel,
  ManifestAuthentication,
  PlaylistInfo,
  Video,
} from "./plugintypes";

export interface NetworkRequest {
  body: Blob | ArrayBuffer;
  headers: { [k: string]: string };
  status: number;
  statusText: string;
  url: string;
}

export interface NetworkRequestOptions {
  auth?: ManifestAuthentication;
}

export interface InfoGataExtension {
  networkRequest: (
    input: RequestInfo,
    init?: RequestInit,
    options?: NetworkRequestOptions
  ) => Promise<NetworkRequest>;
  openLoginWindow?: (
    auth: ManifestAuthentication,
    pluginId: string
  ) => Promise<void>;
  getVersion?: () => Promise<string>;
}

interface CookiePlugins {
  getCookie(url: string, callback: (cookies: string) => void): void;
}

declare global {
  interface Window {
    InfoGata: InfoGataExtension;
    cordovaFetch: typeof fetch;
  }
  interface CordovaPlugins {
    CookiesPlugin: CookiePlugins;
  }
}

export interface UrlInfo {
  url: string;
  headers?: Headers;
}

export interface FileType {
  filelist?: FileList;
  url?: UrlInfo;
}

export interface DirectoryFile extends File {
  webkitRelativePath: string;
}

export const enum SearchResultType {
  Videos = "videos",
  Playlists = "playlists",
  Channels = "channels",
}

export interface PluginAuthentication {
  pluginId: string;
  headers: Record<string, string>;
}

export type NotifyLoginMessage = {
  type: "infogata-extension-notify-login";
  pluginId: string;
  headers: Record<string, string>;
};

export type TrackItemType = {
  type: "video";
  item: Video;
};
export type PlaylistItemType = {
  type: "playlist";
  item: PlaylistInfo;
};
export type ChannelItemType = {
  type: "channel";
  item: Channel;
};

export type ItemMenuType = TrackItemType | PlaylistItemType | ChannelItemType;
