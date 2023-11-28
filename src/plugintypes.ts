export interface SearchAllResult {
  videos?: SearchVideoResult;
  playlists?: SearchPlaylistResult;
  channels?: SearchChannelResult;
}

export interface SearchRequest {
  query: string;
  pageInfo?: PageInfo;
  filterInfo?: FilterInfo;
}

export interface SearchResult {
  filterInfo?: FilterInfo;
  pageInfo?: PageInfo;
}

export interface PageInfo {
  totalResults?: number;
  resultsPerPage: number;
  offset: number;
  nextPage?: string;
  prevPage?: string;
}

export interface FilterInfo {
  filters: Filter[];
}

export interface Video {
  id?: string;
  title: string;
  apiId?: string;
  duration?: number;
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
  originalUrl?: string;
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
  originalUrl?: string;
}

export interface Channel {
  id?: string;
  name: string;
  apiId?: string;
  images?: ImageInfo[];
  pluginId?: string;
  originalUrl?: string;
  isLive?: boolean;
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
  homepage?: string;
  manifest?: Manifest;
}

export interface SearchVideoResult extends SearchResult {
  items: Video[];
}

export interface SearchPlaylistResult extends SearchResult {
  items: PlaylistInfo[];
}

export interface SearchChannelResult extends SearchResult {
  items: Channel[];
}

export interface GetVideoRequest {
  apiId: string;
}

export interface GetLiveVideoRequest {
  channelApiId: string;
}

export interface UserPlaylistRequest {
  pageInfo?: PageInfo;
}

export interface UserChannelRequest {
  pageInfo?: PageInfo;
}

export interface PlaylistVideoRequest {
  apiId?: string;
  isUserPlaylist: boolean;
  pageInfo?: PageInfo;
}

export interface PlaylistVideosResult extends SearchVideoResult {
  playlist?: PlaylistInfo;
}

export interface ChannelVideosRequest {
  apiId?: string;
  pageInfo?: PageInfo;
}

export interface VideoCommentsRequest {
  apiId?: string;
  pageInfo?: PageInfo;
}

export interface VideoCommentsResult {
  comments: VideoComment[];
  pageInfo?: PageInfo;
}

export interface CommentReplyRequest {
  commentApiId: string;
  videoApiId?: string;
  pageInfo?: PageInfo;
}

export interface VideoComment {
  apiId: string;
  videoCommentId?: string;
  content: string;
  images?: ImageInfo[];
  author: string;
  createdDate?: string;
  likes?: number;
  replyCount?: number;
  // Information passed to CommentReplyRequest.page.nextPage
  replyPage?: string;
}

export interface ChannelVideosResult extends SearchVideoResult {
  channel?: Channel;
  isLive?: boolean;
}

export type FilterType = "radio" | "select" | "text";

export interface Filter {
  id: string;
  displayName: string;
  type: FilterType;
  value?: string;
  options?: FilterOption[];
}

export interface FilterOption {
  displayName: string;
  value: string;
}

export interface GetSearchSuggestionRequest {
  query: string;
}

export type ParseUrlType = "playlist" | "video";

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
  authentication?: ManifestAuthentication;
}

export interface ManifestAuthentication {
  loginUrl: string;
  cookiesToFind?: string[];
  loginButton?: string;
  headersToFind?: string[];
  completionUrl?: string;
}

export interface ManifestOptions {
  page: string;
  sameOrigin?: boolean;
}
