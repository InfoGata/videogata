import React from "react";
import { PluginInterface } from "plugin-frame";
import { db } from "../database";
import { useSnackbar } from "notistack";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import {
  addPlaylists,
  addPlaylistVideos,
} from "../store/reducers/playlistReducer";
import { nanoid } from "@reduxjs/toolkit";
import i18n from "../i18n";
import {
  getFileText,
  getFileTypeFromPluginUrl,
  getPlugin,
  getPluginSubdomain,
  hasExtension,
  mapAsync,
} from "../utils";
import { useTranslation } from "react-i18next";
import { Manifest, NetworkRequest } from "../types";
import {
  ChannelVideosResult,
  NotificationMessage,
  Playlist,
  PlaylistInfo,
  PlaylistVideosResult,
  PluginInfo,
  SearchAllResult,
  SearchChannelResult,
  SearchPlaylistResult,
  SearchVideoResult,
  Video,
} from "../plugintypes";
import PluginsContext, {
  PluginContextInterface,
  PluginFrameContainer,
  PluginMessage,
  PluginMethodInterface,
} from "../PluginsContext";
import semverValid from "semver/functions/parse";
import semverGt from "semver/functions/gt";

interface ApplicationPluginInterface extends PluginInterface {
  networkRequest(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<NetworkRequest>;
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

const PluginsProvider: React.FC = (props) => {
  const [pluginsLoaded, setPluginsLoaded] = React.useState(false);
  const hasUpdated = React.useRef(false);

  const [pluginFrames, setPluginFrames] = React.useState<
    PluginFrameContainer[]
  >([]);
  const [pluginMessage, setPluginMessage] = React.useState<PluginMessage>();
  const [pluginsFailed, setPluginsFailed] = React.useState(false);
  const dispatch = useAppDispatch();
  const loadingPlugin = React.useRef(false);
  const { t } = useTranslation("plugins");

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
  const disableAutoUpdatePlugins = useAppSelector(
    (state) => state.settings.disableAutoUpdatePlugins
  );

  const { enqueueSnackbar } = useSnackbar();
  const [pendingPlugins, setPendingPlugins] = React.useState<
    PluginInfo[] | null
  >(null);

  const loadPlugin = React.useCallback(
    async (plugin: PluginInfo, pluginFiles?: FileList) => {
      const api: ApplicationPluginInterface = {
        networkRequest: async (input: RequestInfo, init?: RequestInit) => {
          if (hasExtension()) {
            return await window.InfoGata.networkRequest(input, init);
          }

          const response = await fetch(input, init);

          const body = await response.blob();

          const responseHeaders = Object.fromEntries(
            response.headers.entries()
          );

          // Remove forbidden header
          if (responseHeaders["set-cookie"]) {
            delete responseHeaders["set-cookie"];
          }

          const result = {
            body: body,
            headers: responseHeaders,
            status: response.status,
            statusText: response.statusText,
            url: response.url,
          };
          return result;
        },
        isNetworkRequestCorsDisabled: async () => {
          const isDisabled = hasExtension();
          return isDisabled;
        },
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
          if (import.meta.env.PROD || corsProxyUrlRef.current) {
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
          result.channels?.items.forEach((i) => {
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
          result.channels?.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          result.playlists?.items.forEach((i) => {
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
        onSearchPlaylists: (result: SearchPlaylistResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          return result;
        },
        onSearchChannels: (result: SearchChannelResult) => {
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
        onGetLiveVideo: (video: Video) => {
          video.pluginId = plugin.id;
          return video;
        },
        onGetPlaylistVideos: (result: PlaylistVideosResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          if (result.playlist) {
            result.playlist.pluginId = plugin.id;
          }
          return result;
        },
        onGetChannelVideos: (result: ChannelVideosResult) => {
          result.items.forEach((i) => {
            i.pluginId = plugin.id;
            i.id = nanoid();
          });
          if (result.channel) {
            result.channel.pluginId = plugin.id;
          }
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
        onLookupVideoUrls: (result: Video[]) => {
          result.forEach((t) => {
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
      const timeoutMs = 10000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(), timeoutMs);
      });
      await Promise.race([host.ready(), timeoutPromise]);
      await host.executeCode(plugin.script);
      return host;
    },
    [dispatch, enqueueSnackbar]
  );

  const loadPlugins = React.useCallback(async () => {
    setPluginsFailed(false);
    try {
      const plugs = await db.plugins.toArray();

      const framePromises = plugs.map((p) => loadPlugin(p));
      const frames = await Promise.all(framePromises);
      setPluginFrames(frames);
    } catch {
      enqueueSnackbar(t("failedPlugins"), { variant: "error" });
      setPluginsFailed(true);
    } finally {
      setPluginsLoaded(true);
    }
  }, [loadPlugin, enqueueSnackbar, t]);

  React.useEffect(() => {
    if (loadingPlugin.current) return;
    loadingPlugin.current = true;
    loadPlugins();
  }, [loadPlugins]);

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

  const updatePlugin = React.useCallback(
    async (plugin: PluginInfo, id: string, pluginFiles?: FileList) => {
      const oldPlugin = pluginFrames.find((p) => p.id === id);
      oldPlugin?.destroy();
      const pluginFrame = await loadPlugin(plugin, pluginFiles);
      setPluginFrames(pluginFrames.map((p) => (p.id === id ? pluginFrame : p)));
      await db.plugins.put(plugin);
    },
    [loadPlugin, pluginFrames]
  );

  React.useEffect(() => {
    const checkUpdate = async () => {
      if (pluginsLoaded && !disableAutoUpdatePlugins && !hasUpdated.current) {
        hasUpdated.current = true;
        await mapAsync(pluginFrames, async (p) => {
          if (p.manifestUrl) {
            const fileType = getFileTypeFromPluginUrl(p.manifestUrl);
            const manifestText = await getFileText(fileType, "manifest.json");
            if (manifestText) {
              const manifest = JSON.parse(manifestText) as Manifest;
              if (
                manifest.version &&
                p.version &&
                semverValid(manifest.version) &&
                semverValid(p.version) &&
                semverGt(manifest.version, p.version)
              ) {
                const newPlugin = await getPlugin(fileType);

                if (newPlugin && p.id) {
                  newPlugin.id = p.id;
                  newPlugin.manifestUrl = p.manifestUrl;
                  await updatePlugin(newPlugin, p.id);
                }
              }
            }
          }
        });
      }
    };
    checkUpdate();
  }, [pluginsLoaded, pluginFrames, disableAutoUpdatePlugins, updatePlugin]);

  const defaultContext: PluginContextInterface = {
    addPlugin: addPlugin,
    deletePlugin: deletePlugin,
    updatePlugin: updatePlugin,
    plugins: pluginFrames,
    pluginMessage: pluginMessage,
    pluginsLoaded,
    pluginsFailed,
    reloadPlugins: loadPlugins,
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

export default PluginsProvider;
