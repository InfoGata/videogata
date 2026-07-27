import { useRouter } from "@tanstack/react-router";
import React from "react";
import { PluginFrameContainer } from "../contexts/PluginsContext";
import { defaultPluginMap } from "../default-plugins";
import { PluginInfo } from "../plugintypes";
import { getFileTypeFromPluginUrl, getPlugin } from "../utils";
import usePlugins from "./usePlugins";

interface FindPluginArgs {
  pluginsLoaded: boolean;
  pluginId: string | undefined;
  plugin: PluginFrameContainer | undefined;
}

const useFindPlugin = (args: FindPluginArgs) => {
  const { pluginsLoaded, pluginId, plugin } = args;
  const [isLoading, setIsloading] = React.useState(false);
  const [pendingPlugin, setPendingPlugin] = React.useState<PluginInfo | null>(
    null
  );
  const { plugins } = usePlugins();
  const router = useRouter();
  const invalidatedFor = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    const findPlugin = async () => {
      if (pluginsLoaded && !plugin && pluginId) {
        // Keyed by alias as well as id, so a `/s/<alias>/...` url offers to
        // install the plugin it names.
        const newPlugin = defaultPluginMap.get(pluginId);
        if (newPlugin) {
          setIsloading(true);
          const fileType = getFileTypeFromPluginUrl(newPlugin.url);

          const plugin = await getPlugin(fileType);
          if (plugin) {
            plugin.manifestUrl = newPlugin.url;
            setPendingPlugin(plugin);
          }
          setIsloading(false);
        }
      }
    };

    findPlugin();
  }, [pluginsLoaded, pluginId, plugin]);

  React.useEffect(() => {
    if (!pluginsLoaded || plugin || !pluginId) return;
    if (invalidatedFor.current === pluginId) return;
    // The url named a plugin by alias that wasn't installed when the route
    // parsed its params, so `pluginId` is still that alias. Now that something
    // answers to it, re-match the location to resolve it to the plugin's id.
    if (!plugins.some((p) => p.alias === pluginId)) return;

    invalidatedFor.current = pluginId;
    router.invalidate();
  }, [pluginsLoaded, pluginId, plugin, plugins, router]);

  const removePendingPlugin = () => {
    setPendingPlugin(null);
  };

  return { isLoading, pendingPlugin, removePendingPlugin };
};

export default useFindPlugin;
