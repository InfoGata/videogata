import { Backdrop, CircularProgress, List } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { Channel } from "../plugintypes";
import PlaylistInfoCard from "./PlaylistInfoCard";
import VideoSearchResult from "./VideoSearchResult";

const ChannelPage: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const location = useLocation();
  const state = location.state as Channel | null;
  const [channel, setChannel] = React.useState<Channel | null>(state);

  const getChannelVideos = async () => {
    if (plugin && (await plugin.hasDefined.onGetChannelVideos())) {
      const channelInfo = await plugin.remote.onGetChannelVideos({
        apiId: apiId,
      });

      if (channelInfo.channel) {
        setChannel(channelInfo.channel);
      }
      return channelInfo.items;
    }
    return [];
  };

  const query = useQuery(
    ["pluginplaylist", pluginId, apiId],
    getChannelVideos,
    {
      enabled: pluginsLoaded,
    }
  );

  const videoList = query?.data?.map((v) => (
    <VideoSearchResult key={v.apiId} video={v} />
  ));

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {channel && (
        <PlaylistInfoCard name={channel.name || ""} images={channel.images} />
      )}
      <List>{videoList}</List>
    </>
  );
};

export default ChannelPage;
