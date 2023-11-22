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

export interface InfoGataExtension {
  networkRequest: (
    input: RequestInfo,
    init?: RequestInit
  ) => Promise<NetworkRequest>;
  isLoggedIn?: (auth: ManifestAuthentication) => Promise<boolean>;
  openLoginWindow?: (
    auth: ManifestAuthentication,
    pluginId: string
  ) => Promise<void>;
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
