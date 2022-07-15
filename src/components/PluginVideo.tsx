import React from "react";
import { useParams } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import VideoPlayer from "./VideoPlayer";
import { Video } from "../plugintypes";
import PluginPlayer from "./PluginPlayer";

const PluginVideo: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins } = usePlugins();
  const [video, setVideo] = React.useState<Video>();
  const [usePlayer, setUsePlayer] = React.useState(false);
  const plugin = plugins.find((p) => p.id === pluginId);

  React.useEffect(() => {
    const getVideo = async () => {
      if (plugin && apiId) {
        if (plugin.hasPlayer) {
          setUsePlayer(true);
        } else if (await plugin.hasDefined.onGetVideoFromApiId()) {
          const video = await plugin.remote.onGetVideoFromApiId(apiId);
          setVideo(video);
        }
      }
    };

    getVideo();
  }, [plugin, apiId]);

  return (
    <>
      {video && <VideoPlayer video={video} />}
      {usePlayer && <PluginPlayer apiId={apiId} plugin={plugin} />}
    </>
  );
};

export default PluginVideo;
