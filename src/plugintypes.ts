export interface SearchAllResult {
  videos?: SearchVideoResult;
  playlists?: SearchPlaylistResult;
  channels?: SearchChannelResult;
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
  views?: number;
  likes?: number;
  dislikes?: number;
  description?: string;
  channelName?: string;
  channelApiId?: string;
  recommendedVideos?: Video[];
  uploadDate?: string;
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

export interface Channel {
  name: string;
  apiId?: string;
  images?: ImageInfo[];
  pluginId?: string;
}

export interface Playlist extends PlaylistInfo {
  videos: Video[];
}

export interface ImageInfo {
  url: string;
  height?: number;
  width?: number;
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

export interface SearchChannelResult {
  items: Channel[];
  pageInfo?: PageInfo;
}

export interface UserPlaylistRequest {
  page?: PageInfo;
}

export interface PlaylistVideoRequest {
  apiId?: string;
  isUserPlaylist: boolean;
  page?: PageInfo;
}

export interface PlaylistVideosResult extends SearchVideoResult {
  playlist?: PlaylistInfo;
}

export interface ChannelVideosRequest {
  apiId?: string;
}

export interface VideoCommentsRequest {
  apiId?: string;
  page?: PageInfo;
}

export interface VideoComment {
  apiId: string;
  content: string;
  images: ImageInfo[];
  author: string;
}

export interface VideoCommentsResult {
  comments: VideoComment[];
  page?: PageInfo;
}

export interface ChannelVideosResult extends SearchVideoResult {
  channel?: Channel;
}
