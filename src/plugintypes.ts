export interface SearchAllResult {
  videos?: SearchVideoResult;
  playlists?: SearchPlaylistResult;
}

export interface SearchRequest {
  query: string;
  page?: PageInfo;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
  offset: number;
  nextPage?: string;
  prevPage?: string;
}

export interface Video {
  id?: string;
  title: string;
  apiId?: string;
  duration: number;
  pluginId?: string;
  images?: ImageInfo[];
  sources?: VideoSource[];
}

export interface VideoSource {
  source: string;
  type: string;
}

export interface PlaylistInfo {
  id?: string;
  images?: ImageInfo[];
  name?: string;
  isUserPlaylist?: boolean;
  apiId?: string;
  pluginId?: string;
}

export interface Playlist extends PlaylistInfo {
  videos: Video[];
}

export interface ImageInfo {
  url: string;
  height: number;
  width: number;
}

export interface NotificationMessage {
  message: string;
  type?: "default" | "success" | "error" | "warning" | "info";
}

export interface PluginInfo {
  id?: string;
  name: string;
  script: string;
  version?: string;
  description?: string;
  optionsHtml?: string;
  playerHtml?: string;
  optionsSameOrigin?: boolean;
  manifestUrl?: string;
}

export interface SearchVideoResult {
  items: Video[];
  pageInfo?: PageInfo;
}

export interface SearchPlaylistResult {
  items: PlaylistInfo[];
  pageInfo?: PageInfo;
}

export interface UserPlaylistRequest {
  page?: PageInfo;
}

export interface SearchPlaylistResult {
  items: PlaylistInfo[];
  pageInfo?: PageInfo;
}

export interface PlaylistVideoRequest {
  apiId?: string;
  isUserPlaylist: boolean;
  page?: PageInfo;
}

export interface PlaylistVideosResult extends SearchVideoResult {
  playlist?: PlaylistInfo;
}
