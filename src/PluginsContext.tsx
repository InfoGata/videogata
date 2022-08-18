import React from "react";
import {
  ChannelVideosRequest,
  ChannelVideosResult,
  NotificationMessage,
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
} from "./plugintypes";
import { PluginFrame, PluginInterface } from "plugin-frame";
import { db } from "./database";
import { useSnackbar } from "notistack";
import { useAppSelector } from "./store/hooks";

export interface PluginMethodInterface {
  onSearchAll: (request: SearchRequest) => Promise<SearchAllResult>;
  onSearchVideos: (request: SearchRequest) => Promise<SearchVideoResult>;
  onSearchPlaylists?: (request: SearchRequest) => Promise<SearchPlaylistResult>;
  onGetVideoFromApiId: (apiId: string) => Promise<Video>;
  onGetUserPlaylists: (
    request: UserPlaylistRequest
  ) => Promise<SearchPlaylistResult>;
  onGetPlaylistVideos: (
    request: PlaylistVideoRequest
  ) => Promise<PlaylistVideosResult>;
  onSearchChannels: (request: SearchRequest) => Promise<SearchChannelResult>;
  onGetChannelVideos: (
    request: ChannelVideosRequest
  ) => Promise<ChannelVideosResult>;
  onUiMessage: (message: any) => Promise<void>;
}

interface ApplicationPluginInterface extends PluginInterface {
  postUiMessage: (message: any) => Promise<void>;
  getPluginId: () => Promise<string>;
  createNotification: (notification: NotificationMessage) => Promise<void>;
  endVideo: () => Promise<void>;
  getCorsProxy: () => Promise<string | undefined>;
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
  const { enqueueSnackbar } = useSnackbar();
  // Store variables being used by plugin methods in refs
  // in order to not get stale state
  const corsProxyUrl = useAppSelector((state) => state.settings.corsProxyUrl);
  const corsProxyUrlRef = React.useRef(corsProxyUrl);
  corsProxyUrlRef.current = corsProxyUrl;
  const currentVideo = useAppSelector((state) => state.queue.currentVideo);
  const currentVideoRef = React.useRef(currentVideo);
  currentVideoRef.current = currentVideo;

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
        endVideo: async () => {
          const video = currentVideoRef.current;
          if (video?.pluginId === plugin.id) {
            const event = new CustomEvent("nextVideo");
            document.dispatchEvent(event);
          }
        },
      };

      let srcUrl = `${window.location.protocol}//${plugin.id}.${window.location.host}/pluginframe.html`;

      const completeMethods: { [key in keyof PluginMethodInterface]?: any } = {
        onSearchAll: (result: SearchAllResult) => {
          result.videos?.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return result;
        },
        onSearchVideos: (result: SearchVideoResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
          });
          return result;
        },
        onGetVideoFromApiId: (video: Video) => {
          video.pluginId = plugin.id;
          return video;
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
    [enqueueSnackbar]
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
    getPlugins();
  }, [loadPlugin]);

  const deletePlugin = async (pluginFrame: PluginFrameContainer) => {
    const newPlugins = pluginFrames.filter((p) => p.id !== pluginFrame.id);
    setPluginFrames(newPlugins);
    await db.plugins.delete(pluginFrame.id || "");
  };

  const addPlugin = async (plugin: PluginInfo) => {
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
    await db.plugins.update(id, plugin);
  };

  const defaultContext: PluginContextInterface = {
    addPlugin: addPlugin,
    deletePlugin: deletePlugin,
    updatePlugin: updatePlugin,
    plugins: pluginFrames,
    pluginMessage: pluginMessage,
    pluginsLoaded,
  };

  return (
    <PluginsContext.Provider value={defaultContext}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => React.useContext(PluginsContext);

export default PluginsContext;
