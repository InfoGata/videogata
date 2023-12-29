import React from "react";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import useFindPlugin from "../hooks/useFindPlugin";
import usePlugins from "../hooks/usePlugins";
import { setPlayerInfo } from "../store/reducers/playerReducer";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import PluginVideoInfo from "../components/PluginVideoInfo";
import Spinner from "../components/Spinner";

const PluginVideo: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const dispatch = useDispatch();
  const { apiId } = useParams<"apiId">();
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
  };

  const query = useQuery(["pluginLive", pluginId, apiId], getVideo, {
    enabled: pluginsLoaded,
  });

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

export default PluginVideo;
