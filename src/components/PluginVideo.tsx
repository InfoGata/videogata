import React from "react";
import { useParams } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import VideoPlayer from "./VideoPlayer";
import { useQuery } from "react-query";

const PluginVideo: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);

  const getVideo = async () => {
    if (plugin && (await plugin.hasDefined.onGetVideoFromApiId()) && apiId) {
      const video = await plugin.remote.onGetVideoFromApiId(apiId);
      return video;
    }
  };

  const query = useQuery(["pluginvideo", pluginId, apiId], getVideo);

  return <>{query.data && <VideoPlayer video={query.data} />}</>;
};

export default PluginVideo;
