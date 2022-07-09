import React from "react";
import { useParams } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { Video } from "../plugintypes";
import VideoPlayer from "./VideoPlayer";

const PluginVideo: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins } = usePlugins();
  const [video, setVideo] = React.useState<Video>();
  const plugin = plugins.find((p) => p.id === pluginId);

  React.useEffect(() => {
    const getVideo = async () => {
      if (plugin && (await plugin.hasDefined.onGetVideoFromApiId()) && apiId) {
        const video = await plugin.remote.onGetVideoFromApiId(apiId);
        setVideo(video);
      }
    };

    getVideo();
  }, [pluginId, apiId, plugin]);

  return <>{video && <VideoPlayer video={video} />}</>;
};

export default PluginVideo;
