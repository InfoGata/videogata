import React from "react";
import {
  ChannelVideosRequest,
  ChannelVideosResult,
  CommentReplyRequest,
  GetVideoRequest,
  NotificationMessage,
  ParseUrlType,
  Playlist,
  PlaylistInfo,
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
import { PluginFrame, PluginInterface } from "plugin-frame";
import { db } from "./database";
import { useSnackbar } from "notistack";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import ConfirmPluginDialog from "./components/ConfirmPluginDialog";
import {
  addPlaylists,
  addPlaylistVideos,
} from "./store/reducers/playlistReducer";
import { nanoid } from "@reduxjs/toolkit";
import i18n from "./i18n";
import { getPluginSubdomain } from "./utils";

export interface PluginMethodInterface {
  onSearchAll(request: SearchRequest): Promise<SearchAllResult>;
  onSearchVideos(request: SearchRequest): Promise<SearchVideoResult>;
  onSearchPlaylists(request: SearchRequest): Promise<SearchPlaylistResult>;
  onGetVideo(request: GetVideoRequest): Promise<Video>;
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
}

interface ApplicationPluginInterface extends PluginInterface {
  postUiMessage(message: any): Promise<void>;
  getPluginId(): Promise<string>;
  createNotification(notification: NotificationMessage): Promise<void>;
  endVideo(): Promise<void>;
  getCorsProxy(): Promise<string | undefined>;
  installPlugins(plugins: PluginInfo[]): Promise<void>;
  getPlugins(): Promise<PluginInfo[]>;
  getPlaylists(): Promise<Playlist[]>;
  getPlaylistsInfo(): Promise<PlaylistInfo[]>;
  addPlaylists(playlists: Playlist[]): Promise<void>;
  addVideosToPlaylist(playlistId: string, tracks: Video[]): Promise<void>;
}

interface PluginMessage {
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
}

const PluginsContext = React.createContext<PluginContextInterface>(undefined!);

export const PluginsProvider: React.FC = (props) => {
  const [pluginsLoaded, setPluginsLoaded] = React.useState(false);
  const [pluginFrames, setPluginFrames] = React.useState<
    PluginFrameContainer[]
  >([]);
  const [pluginMessage, setPluginMessage] = React.useState<PluginMessage>();
  const dispatch = useAppDispatch();
  const loadingPlugin = React.useRef(false);

  // Store variables being used by plugin methods in refs
  // in order to not get stale state
  const corsProxyUrl = useAppSelector((state) => state.settings.corsProxyUrl);
  const corsProxyUrlRef = React.useRef(corsProxyUrl);
  corsProxyUrlRef.current = corsProxyUrl;
  const currentVideo = useAppSelector((state) => state.queue.currentVideo);
  const currentVideoRef = React.useRef(currentVideo);
  currentVideoRef.current = currentVideo;
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const playlistsRef = React.useRef(playlists);
  playlistsRef.current = playlists;

  const { enqueueSnackbar } = useSnackbar();
  const [pendingPlugins, setPendingPlugins] = React.useState<
    PluginInfo[] | null
  >(null);

  const loadPlugin = React.useCallback(
    async (plugin: PluginInfo, pluginFiles?: FileList) => {
      const api: ApplicationPluginInterface = {
        postUiMessage: async (message: any) => {
          setPluginMessage({ pluginId: plugin.id, message });
        },
        getPluginId: async () => {
          return plugin.id || "";
        },
        createNotification: async (notification: NotificationMessage) => {
          enqueueSnackbar(notification.message, { variant: notification.type });
        },
        getCorsProxy: async () => {
          if (
            process.env.NODE_ENV === "production" ||
            corsProxyUrlRef.current
          ) {
            return corsProxyUrlRef.current;
          } else {
            return "http://localhost:8085/";
          }
        },
        getPlugins: async () => {
          const plugs = await db.plugins.toArray();
          return plugs;
        },
        installPlugins: async (plugins: PluginInfo[]) => {
          setPendingPlugins(plugins);
        },
        endVideo: async () => {
          const video = currentVideoRef.current;
          if (video?.pluginId === plugin.id) {
            const event = new CustomEvent("nextVideo");
            document.dispatchEvent(event);
          }
        },
        getPlaylists: async () => {
          return await db.playlists.toArray();
        },
        getPlaylistsInfo: async () => {
          return playlistsRef.current;
        },
        addPlaylists: async (playlists: Playlist[]) => {
          dispatch(addPlaylists(playlists));
        },
        addVideosToPlaylist: async (playlistId: string, videos: Video[]) => {
          videos.forEach((t) => {
            if (!t.pluginId) {
              t.pluginId = plugin.id;
            }
          });
          const playlist = playlistsRef.current.find(
            (p) => p.id === playlistId
          );
          if (playlist) {
            dispatch(addPlaylistVideos(playlist, videos));
          }
        },
        getLocale: async () => {
          return i18n.language;
        },
      };

      const srcUrl = `${getPluginSubdomain(plugin.id)}/pluginframe.html`;

      const completeMethods: {
        [key in keyof PluginMethodInterface]?: (
          arg: any
        ) =>
          | ReturnType<PluginMethodInterface[key]>
          | Awaited<ReturnType<PluginMethodInterface[key]>>;
      } = {
        onSearchAll: (result: SearchAllResult) => {
          result.videos?.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          result.playlists?.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          return result;
        },
        onGetTopItems: (result: SearchAllResult) => {
          result.videos?.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          return result;
        },
        onSearchVideos: (result: SearchVideoResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          return result;
        },
        onGetVideo: (video: Video) => {
          video.pluginId = plugin.id;
          return video;
        },
        onGetPlaylistVideos: (result: PlaylistVideosResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          return result;
        },
        onGetChannelVideos: (result: ChannelVideosResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          return result;
        },
        onLookupPlaylistUrl: (result: Playlist) => {
          result.id = nanoid();
          result.pluginId = plugin.id;
          result.videos.forEach((t) => {
            t.id = nanoid();
            t.pluginId = plugin.id;
          });
          return result;
        },
      };

      const host = new PluginFrameContainer(api, {
        frameSrc: new URL(srcUrl),
        sandboxAttributes: ["allow-scripts", "allow-same-origin"],
        completeMethods: completeMethods,
      });

      host.id = plugin.id;
      host.optionsSameOrigin = plugin.optionsSameOrigin;
      host.name = plugin.name;
      host.version = plugin.version;
      host.hasOptions = !!plugin.optionsHtml;
      host.hasPlayer = !!plugin.playerHtml;
      host.fileList = pluginFiles;
      host.manifestUrl = plugin.manifestUrl;
      await host.ready();
      await host.executeCode(plugin.script);
      return host;
    },
    [dispatch, enqueueSnackbar]
  );

  React.useEffect(() => {
    const getPlugins = async () => {
      try {
        const plugs = await db.plugins.toArray();

        const framePromises = plugs.map((p) => loadPlugin(p));
        const frames = await Promise.all(framePromises);
        setPluginFrames(frames);
      } finally {
        setPluginsLoaded(true);
      }
    };
    if (loadingPlugin.current) return;
    loadingPlugin.current = true;
    getPlugins();
    getPlugins();
  }, [loadPlugin]);

  const deletePlugin = async (pluginFrame: PluginFrameContainer) => {
    const newPlugins = pluginFrames.filter((p) => p.id !== pluginFrame.id);
    setPluginFrames(newPlugins);
    await db.plugins.delete(pluginFrame.id || "");
  };

  const addPlugin = async (plugin: PluginInfo) => {
    if (pluginFrames.some((p) => p.id === plugin.id)) {
      enqueueSnackbar(`A plugin with Id ${plugin.id} is already installed`);
      return;
    }
    const pluginFrame = await loadPlugin(plugin);
    setPluginFrames([...pluginFrames, pluginFrame]);
    await db.plugins.add(plugin);
  };

  const updatePlugin = async (
    plugin: PluginInfo,
    id: string,
    pluginFiles?: FileList
  ) => {
    const oldPlugin = pluginFrames.find((p) => p.id === id);
    oldPlugin?.destroy();
    const pluginFrame = await loadPlugin(plugin, pluginFiles);
    setPluginFrames(pluginFrames.map((p) => (p.id === id ? pluginFrame : p)));
    await db.plugins.put(plugin);
  };

  const defaultContext: PluginContextInterface = {
    addPlugin: addPlugin,
    deletePlugin: deletePlugin,
    updatePlugin: updatePlugin,
    plugins: pluginFrames,
    pluginMessage: pluginMessage,
    pluginsLoaded,
  };

  const handleClose = () => {
    setPendingPlugins(null);
  };

  return (
    <PluginsContext.Provider value={defaultContext}>
      {props.children}
      <ConfirmPluginDialog
        open={Boolean(pendingPlugins)}
        plugins={pendingPlugins || []}
        handleClose={handleClose}
      />
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => React.useContext(PluginsContext);

export default PluginsContext;
