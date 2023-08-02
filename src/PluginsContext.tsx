import { PluginFrame } from "plugin-frame";
import React from "react";
import {
  ChannelVideosRequest,
  ChannelVideosResult,
  CommentReplyRequest,
  GetLiveVideoRequest,
  GetVideoRequest,
  ParseUrlType,
  Playlist,
  PlaylistVideoRequest,
  PlaylistVideosResult,
  PluginInfo,
  SearchAllResult,
  SearchChannelResult,
  SearchPlaylistResult,
  SearchRequest,
  SearchVideoResult,
  UserPlaylistRequest,
  Video,
  VideoCommentsRequest,
  VideoCommentsResult,
} from "./plugintypes";

export interface PluginMethodInterface {
  onSearchAll(request: SearchRequest): Promise<SearchAllResult>;
  onSearchVideos(request: SearchRequest): Promise<SearchVideoResult>;
  onSearchPlaylists(request: SearchRequest): Promise<SearchPlaylistResult>;
  onGetVideo(request: GetVideoRequest): Promise<Video>;
  onGetLiveVideo(request: GetLiveVideoRequest): Promise<Video | undefined>;
  onGetUserPlaylists(
    request: UserPlaylistRequest
  ): Promise<SearchPlaylistResult>;
  onGetPlaylistVideos(
    request: PlaylistVideoRequest
  ): Promise<PlaylistVideosResult>;
  onSearchChannels(request: SearchRequest): Promise<SearchChannelResult>;
  onGetChannelVideos(
    request: ChannelVideosRequest
  ): Promise<ChannelVideosResult>;
  onUiMessage(message: any): Promise<void>;
  onUsePlayer(): Promise<boolean>;
  onGetVideoComments(
    request: VideoCommentsRequest
  ): Promise<VideoCommentsResult>;
  onGetCommentReplies(
    request: CommentReplyRequest
  ): Promise<VideoCommentsResult>;
  onGetTopItems(): Promise<SearchAllResult>;
  onCanParseUrl(url: string, type: ParseUrlType): Promise<boolean>;
  onLookupPlaylistUrl(url: string): Promise<Playlist>;
  onLookupVideoUrls(urls: string[]): Promise<Video[]>;
}

export interface PluginMessage {
  pluginId?: string;
  message: any;
}

export class PluginFrameContainer extends PluginFrame<PluginMethodInterface> {
  name?: string;
  id?: string;
  hasOptions?: boolean;
  fileList?: FileList;
  optionsSameOrigin?: boolean;
  version?: string;
  manifestUrl?: string;
  hasPlayer?: boolean;
}

export interface PluginContextInterface {
  addPlugin: (plugin: PluginInfo, pluginFiles?: FileList) => Promise<void>;
  updatePlugin: (
    plugin: PluginInfo,
    id: string,
    pluginFiles?: FileList
  ) => Promise<void>;
  deletePlugin: (plugin: PluginFrameContainer) => Promise<void>;
  plugins: PluginFrameContainer[];
  pluginMessage?: PluginMessage;
  pluginsLoaded: boolean;
  pluginsFailed: boolean;
  reloadPlugins: () => Promise<void>;
}

const PluginsContext = React.createContext<PluginContextInterface>(undefined!);

export default PluginsContext;
