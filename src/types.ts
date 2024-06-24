import {
  LinkOptions,
  LinkProps
} from "@tanstack/react-router";
import {
  Channel,
  ManifestAuthentication,
  PlaylistInfo,
  Video,
} from "./plugintypes";
import { router } from "./router";

export interface NetworkRequest {
  body: Blob | ArrayBuffer | null;
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
    input: string,
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
  domainHeaders?: Record<string, Record<string, string>>;
}

export type NotifyLoginMessage = {
  type: "infogata-extension-notify-login";
  pluginId: string;
  headers: Record<string, string>;
  domainHeaders: Record<string, Record<string, string>>;
};

export type VideoItemType = {
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

export type ItemMenuType = VideoItemType | PlaylistItemType | ChannelItemType;

export interface LoginInfo {
  foundCookies: boolean;
  foundHeaders: boolean;
  foundCompletionUrl: boolean;
  headers: Record<string, string>;
}

export type LinkRouterProps = LinkOptions<typeof router> & LinkProps;

export interface NavigationLinkItem {
  title: string;
  link?: LinkRouterProps;
  action?: () => void;
  icon: React.JSX.Element;
}
