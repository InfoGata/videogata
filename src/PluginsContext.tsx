import React from "react";
import {
  PluginInfo,
  SearchAllResult,
  SearchRequest,
  SearchVideoResult,
  Video,
} from "./plugintypes";
import { PluginFrame } from "plugin-frame";
import { db } from "./database";

export interface PluginInterface {
  onSearchAll: (request: SearchRequest) => Promise<SearchAllResult>;
  onSearchVideos: (request: SearchRequest) => Promise<SearchVideoResult>;
  onGetVideoFromApiId: (apiId: string) => Promise<Video>;
}

export class PluginFrameContainer extends PluginFrame<PluginInterface> {
  name?: string;
  id?: string;
  hasOptions?: boolean;
  fileList?: FileList;
  optionsSameOrigin?: boolean;
  version?: string;
  manifestUrl?: string;
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
}

const PluginsContext = React.createContext<PluginContextInterface>(undefined!);

export const PluginsProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [pluginFrames, setPluginFrames] = React.useState<
    PluginFrameContainer[]
  >([]);

  const loadPlugin = React.useCallback(async (plugin: PluginInfo) => {
    const api = {};

    let srcUrl = `${window.location.protocol}//${plugin.id}.${window.location.host}/pluginframe.html`;

    const completeMethods: { [key in keyof PluginInterface]?: any } = {
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
    host.manifestUrl = plugin.manifestUrl;
    await host.ready();
    await host.executeCode(plugin.script);
    return host;
  }, []);

  React.useEffect(() => {
    const getPlugins = async () => {
      const plugs = await db.plugins.toArray();

      const framePromises = plugs.map((p) => loadPlugin(p));
      const frames = await Promise.all(framePromises);
      setPluginFrames(frames);
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
    const pluginFrame = await loadPlugin(plugin);
    setPluginFrames(pluginFrames.map((p) => (p.id === id ? pluginFrame : p)));
    await db.plugins.update(id, plugin);
  };

  const defaultContext: PluginContextInterface = {
    addPlugin: addPlugin,
    deletePlugin: deletePlugin,
    updatePlugin: updatePlugin,
    plugins: pluginFrames,
  };

  return (
    <PluginsContext.Provider value={defaultContext}>
      {props.children}
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => React.useContext(PluginsContext);

export default PluginsContext;
