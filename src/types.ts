export interface UrlInfo {
  url: string;
  headers: Headers;
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
}

export interface ManifestOptions {
  page: string;
  sameOrigin?: boolean;
}
