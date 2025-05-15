import { nanoid } from "@reduxjs/toolkit";
import { PluginInterface } from "plugin-frame";
import React from "react";
import { useTranslation } from "react-i18next";
import semverGt from "semver/functions/gt";
import semverValid from "semver/functions/parse";
import { toast } from "sonner";
import PluginsContext, {
  PluginContextInterface,
  PluginFrameContainer,
  PluginMessage,
  PluginMethodInterface,
} from "../PluginsContext";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import { db } from "../database";
import { defaultPlugins } from "../default-plugins";
import i18n from "../i18n";
import {
  ChannelVideosResult,
  EnvironmentInfo,
  Manifest,
  NotificationMessage,
  Playlist,
  PlaylistInfo,
  PlaylistVideosResult,
  PluginInfo,
  SearchAllResult,
  SearchChannelResult,
  SearchPlaylistResult,
  SearchVideoResult,
  Theme,
  Video,
} from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addPlaylistVideos,
  addPlaylists,
} from "../store/reducers/playlistReducer";
import { setPluginsPreInstalled } from "../store/reducers/settingsReducer";
import { NetworkRequest } from "../types";
import { mapAsync } from "@infogata/utils";
import {
  corsIsDisabled,
  getFileText,
  getFileTypeFromPluginUrl,
  getPlugin,
  getPluginUrl,
  hasExtension,
  isAuthorizedDomain,
} from "../utils";
import { useTheme } from "./ThemeProvider";

interface ApplicationPluginInterface extends PluginInterface {
  networkRequest(input: string, init?: RequestInit): Promise<NetworkRequest>;
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
  addVideosToPlaylist(playlistId: string, videos: Video[]): Promise<void>;
  isLoggedIn(): Promise<boolean>;
  getTheme(): Promise<Theme>;
  getEnvironmentInfo(): Promise<EnvironmentInfo>;
  isNetworkRequestCorsDisabled(): Promise<boolean>;
}

const PluginsProvider: React.FC<React.PropsWithChildren> = (props) => {
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

  const pluginsPreinstalled = useAppSelector(
    (state) => state.settings.pluginsPreinstalled
  );
  const [preinstallComplete, setPreinstallComplete] =
    React.useState(pluginsPreinstalled);

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
  const theme = useTheme();
  const themeRef = React.useRef(theme.theme);
  themeRef.current = theme.theme;

  const [pendingPlugins, setPendingPlugins] = React.useState<
    PluginInfo[] | null
  >(null);

  const loadPlugin = React.useCallback(
    async (plugin: PluginInfo, pluginFiles?: FileList) => {
      const api: ApplicationPluginInterface = {
        networkRequest: async (input: string, init?: RequestInit) => {
          const pluginAuth = plugin?.id
            ? await db.pluginAuths.get(plugin.id)
            : undefined;
          const newInit = init ?? {};

          if (
            !plugin?.manifest?.authentication ||
            !isAuthorizedDomain(
              input,
              plugin.manifest.authentication.loginUrl,
              plugin.manifest.authentication.domainHeadersToFind
            )
          ) {
            newInit.credentials = "omit";
          }

          if (pluginAuth) {
            if (Object.keys(pluginAuth.headers).length > 0) {
              const headers = new Headers(newInit.headers);
              for (const prop in pluginAuth.headers) {
                headers.set(prop, pluginAuth.headers[prop]);
              }
              newInit.headers = Object.fromEntries(headers.entries());
            } else if (Object.keys(pluginAuth.domainHeaders ?? {}).length > 0) {
              const url = new URL(input);
              const domainHeaderKey = Object.keys(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                pluginAuth.domainHeaders!
              ).find((dh) => url.host.endsWith(dh));
              if (domainHeaderKey) {
                const headers = new Headers(newInit.headers);
                for (const prop in pluginAuth.domainHeaders?.[
                  domainHeaderKey
                ]) {
                  headers.set(
                    prop,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    pluginAuth.domainHeaders![domainHeaderKey][prop]
                  );
                }
                newInit.headers = Object.fromEntries(headers.entries());
              }
            }
          }

          if (hasExtension() && window.InfoGata?.networkRequest) {
            return await window.InfoGata.networkRequest(input, newInit, {
              auth: plugin.manifest?.authentication,
            });
          }

          const response = await fetch(input, newInit);

          const body = await response.blob();

          const responseHeaders = Object.fromEntries(
            response.headers.entries()
          );

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
          return corsIsDisabled();
        },
        postUiMessage: async (message: any) => {
          setPluginMessage({ pluginId: plugin.id, message });
        },
        getPluginId: async () => {
          return plugin.id || "";
        },
        createNotification: async (notification: NotificationMessage) => {
          let toaster = toast.message;
          switch (notification.type) {
            case "error":
              toaster = toast.error;
              break;
            case "success":
              toaster = toast.success;
              break;
            case "info":
              toaster = toast.info;
              break;
            case "warning":
              toaster = toast.warning;
              break;
          }
          toaster(notification.message);
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
        isLoggedIn: async () => {
          if (plugin.manifest?.authentication && plugin.id) {
            const pluginAuth = await db.pluginAuths.get(plugin.id);
            return !!pluginAuth;
          }
          return false;
        },
        getTheme: async () => {
          return themeRef.current;
        },
        getEnvironmentInfo: async () => {
          const info: EnvironmentInfo = {};
          if (hasExtension() && window.InfoGata?.getVersion) {
            info.extensionVerion = await window.InfoGata.getVersion();
          }

          return info;
        },
      };

      const srcUrl = getPluginUrl(plugin.id || "", "/pluginframe.html");

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
          video.id = nanoid();
          video.recommendedVideos?.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          return video;
        },
        onGetLiveVideo: (video: Video) => {
          video.pluginId = plugin.id;
          video.id = nanoid();
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
        onGetUserChannels: (result: SearchChannelResult) => {
          result.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          return result;
        },
        onGetUserPlaylists: (result: SearchPlaylistResult) => {
          result.items.forEach((i) => {
            i.id = nanoid();
            i.pluginId = plugin.id;
          });
          return result;
        },
      };

      const host = new PluginFrameContainer(api, {
        frameSrc: srcUrl,
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
    [dispatch]
  );

  const loadPlugins = React.useCallback(async () => {
    setPluginsFailed(false);
    try {
      const plugs = await db.plugins.toArray();

      const framePromises = plugs.map((p) => loadPlugin(p));
      const frames = await Promise.all(framePromises);
      setPluginFrames(frames);
    } catch {
      toast.error(t("failedPlugins"));
      setPluginsFailed(true);
    } finally {
      setPluginsLoaded(true);
    }
  }, [loadPlugin, t]);

  React.useEffect(() => {
    if (loadingPlugin.current) return;
    loadingPlugin.current = true;
    loadPlugins();
  }, [loadPlugins]);

  const deletePlugin = async (pluginFrame: PluginFrameContainer) => {
    const newPlugins = pluginFrames.filter((p) => p.id !== pluginFrame.id);
    setPluginFrames(newPlugins);
    await db.plugins.delete(pluginFrame.id || "");
    await db.pluginAuths.delete(pluginFrame.id || "");
  };

  const addPlugin = async (plugin: PluginInfo) => {
    if (pluginFrames.some((p) => p.id === plugin.id)) {
      toast(`A plugin with Id ${plugin.id} is already installed`);
      return;
    }
    await loadAndAddPlugin(plugin);
  };

  const loadAndAddPlugin = React.useCallback(
    async (plugin: PluginInfo) => {
      const pluginFrame = await loadPlugin(plugin);
      setPluginFrames((prev) => [...prev, pluginFrame]);
      await db.plugins.put(plugin);
    },
    [loadPlugin]
  );

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
    const preinstall = async () => {
      if (pluginsLoaded && !pluginsPreinstalled) {
        try {
          // Make sure preinstall plugins aren't already installed
          const presinstallPlugins = defaultPlugins.filter(
            (dp) => !!dp.preinstall
          );
          const plugs = await db.plugins.toArray();
          const newPlugins = presinstallPlugins.filter(
            (preinstall) => !plugs.some((pf) => pf.id === preinstall.id)
          );
          await mapAsync(newPlugins, async (newPlugin) => {
            const fileType = getFileTypeFromPluginUrl(newPlugin.url);
            const plugin = await getPlugin(fileType, true);
            if (!plugin) return;

            await loadAndAddPlugin(plugin);
          });
          dispatch(setPluginsPreInstalled());
        } finally {
          setPreinstallComplete(true);
        }
      }
    };

    preinstall();
  }, [dispatch, pluginsLoaded, pluginsPreinstalled, loadAndAddPlugin]);

  React.useEffect(() => {
    const checkUpdate = async () => {
      if (pluginsLoaded && !disableAutoUpdatePlugins && !hasUpdated.current) {
        hasUpdated.current = true;
        await mapAsync(pluginFrames, async (p) => {
          if (p.manifestUrl) {
            const fileType = getFileTypeFromPluginUrl(p.manifestUrl);
            const manifestText = await getFileText(
              fileType,
              "manifest.json",
              true
            );
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
    preinstallComplete: preinstallComplete ?? false,
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
