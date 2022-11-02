declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DOMAIN: string;
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
