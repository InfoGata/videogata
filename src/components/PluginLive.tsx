import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import useFindPlugin from "../hooks/useFindPlugin";
import usePlugins from "../hooks/usePlugins";
import { Video } from "../plugintypes";
import ConfirmPluginDialog from "./ConfirmPluginDialog";
import PluginVideoInfo from "./PluginVideoInfo";
import { useDispatch } from "react-redux";
import { setPlayerInfo } from "../store/reducers/playerReducer";

const PluginVideo: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const dispatch = useDispatch();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const [video, setVideo] = React.useState<Video>();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  React.useEffect(() => {
    dispatch(setPlayerInfo({ pluginId, isLive: true, channelApiId: apiId }));
  }, [dispatch, apiId, pluginId]);

  React.useEffect(() => {
    const getVideo = async () => {
      if (pluginsLoaded && plugin && apiId) {
        if (await plugin.hasDefined.onGetVideo()) {
          const video = await plugin.remote.onGetLiveVideo({
            channelApiId: apiId,
          });
          setVideo(video);
        }
      }
    };

    getVideo();
  }, [pluginsLoaded, plugin, apiId]);

  return (
    <>
      <Backdrop open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {video && <PluginVideoInfo video={video} />}
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </>
  );
};

export default PluginVideo;
