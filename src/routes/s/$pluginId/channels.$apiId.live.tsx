import { createFileRoute } from "@tanstack/react-router";
import {
  canonicalizePluginUrl,
  pluginIdParams,
} from "@/lib/plugin-route";
import PluginNotInstalled from "@/components/Plugins/PluginNotInstalled";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePlugins from "@/hooks/usePlugins";
import { setPlayerInfo } from "@/store/reducers/playerReducer";
import ConfirmPluginDialog from "@/components/ConfirmPluginDialog";
import PluginVideoInfo from "@/components/PluginVideoInfo";
import Spinner from "@/components/Spinner";

const PluginVideo: React.FC = () => {
  const dispatch = useDispatch();
  const { pluginId, apiId } = Route.useParams();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  React.useEffect(() => {
    dispatch(setPlayerInfo({ pluginId, isLive: true, channelApiId: apiId }));
  }, [dispatch, apiId, pluginId]);

  const getVideo = async () => {
    if (pluginsLoaded && plugin && apiId) {
      if (await plugin.hasDefined.onGetVideo()) {
        const video = await plugin.remote.onGetLiveVideo({
          channelApiId: apiId,
        });
        return video;
      }
    }
    return null;
  };

  const query = useQuery({
    queryKey: ["pluginLive", pluginId, apiId],
    queryFn: getVideo,
    enabled: pluginsLoaded,
  });

  if (pluginsLoaded && !plugin && !pendingPlugin && !isLoading) {
    return <PluginNotInstalled />;
  }

  return (
    <>
      <Spinner open={isLoading} />
      {query.data && <PluginVideoInfo video={query.data} />}
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </>
  );
};

export const Route = createFileRoute("/s/$pluginId/channels/$apiId/live")({
  component: PluginVideo,
  params: pluginIdParams<{ apiId: string }>(),
  beforeLoad: canonicalizePluginUrl,
});
