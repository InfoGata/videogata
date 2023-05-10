import React from "react";
import { useParams } from "react-router-dom";
import { Video } from "../plugintypes";
import PluginPlayer from "./PluginPlayer";
import PluginVideoInfo from "./PluginVideoInfo";
import { Backdrop, CircularProgress } from "@mui/material";
import ConfirmPluginDialog from "./ConfirmPluginDialog";
import useFindPlugin from "../hooks/useFindPlugin";
import usePlugins from "../hooks/usePlugins";
import VideoPlayer from "./VideoPlayer";

const PluginVideo: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const [video, setVideo] = React.useState<Video>();
  const [usePlayer, setUsePlayer] = React.useState(false);
  const plugin = plugins.find((p) => p.id === pluginId);
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  React.useEffect(() => {
    const getVideo = async () => {
      if (pluginsLoaded && plugin && apiId) {
        if (plugin.hasPlayer) {
          setUsePlayer(true);
          if (await plugin.hasDefined.onUsePlayer()) {
            setUsePlayer(await plugin.remote.onUsePlayer());
          }
        }
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
      {usePlayer && (
        <PluginPlayer plugin={plugin} isLive={true} channelApiId={apiId} />
      )}
      {video && !usePlayer ? <VideoPlayer video={video} /> : null}
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
