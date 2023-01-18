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
}

declare global {
  interface Window {
    InfoGata: InfoGataExtension;
  }
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_DOMAIN: string;
    }
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

export interface Manifest {
  name: string;
  script: string;
  id?: string;
  version?: string;
  description?: string;
  options?: string | ManifestOptions;
  player?: string;
  updateUrl?: string;
  homepage?: string;
}

export interface ManifestOptions {
  page: string;
  sameOrigin?: boolean;
}

export const enum SearchResultType {
  Videos = "videos",
  Playlists = "playlists",
  Channels = "channels",
}
