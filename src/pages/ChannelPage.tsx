import HomeVideoCard from "@/components/HomeVideoCard";
import VideoContainer from "@/components/VideoContainer";
import React from "react";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import Pager from "../components/Pager";
import PlaylistInfoCard from "../components/PlaylistInfoCard";
import Spinner from "../components/Spinner";
import useFindPlugin from "../hooks/useFindPlugin";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import { Channel, PageInfo } from "../plugintypes";

const ChannelPage: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const location = useLocation();
  const state = location.state as Channel | null;
  const [isLive, setIsLive] = React.useState<boolean>();
  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);
  const [channel, setChannel] = React.useState<Channel | null>(state);
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const getChannelVideos = async () => {
    if (plugin && (await plugin.hasDefined.onGetChannelVideos())) {
      const channelInfo = await plugin.remote.onGetChannelVideos({
        apiId: apiId,
        pageInfo: page,
      });

      if (channelInfo.channel) {
        setChannel(channelInfo.channel);
      }
      setCurrentPage(channelInfo.pageInfo);
      setIsLive(channelInfo.isLive);
      return channelInfo.items;
    }
    return [];
  };

  const query = useQuery(
    ["pluginplaylist", pluginId, apiId, page],
    getChannelVideos,
    {
      enabled: pluginsLoaded && !!plugin,
    }
  );

  const videoCards = query.data?.map((v) => {
    return <HomeVideoCard key={v.apiId} video={v} />;
  });

  return (
    <>
      <Spinner open={query.isLoading || isLoading} />
      {channel && (
        <PlaylistInfoCard
          name={channel.name || ""}
          images={channel.images}
          isLive={isLive}
          pluginId={channel.pluginId}
          channelApiId={channel.apiId}
        />
      )}
      <VideoContainer>{videoCards}</VideoContainer>
      <Pager
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </>
  );
};

export default ChannelPage;
