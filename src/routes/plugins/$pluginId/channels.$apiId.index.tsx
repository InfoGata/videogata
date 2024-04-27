import { createFileRoute, useRouterState } from "@tanstack/react-router";
import HomeVideoCard from "@/components/HomeVideoCard";
import VideoContainer from "@/components/VideoContainer";
import React from "react";
import { useQuery } from "react-query";
import ConfirmPluginDialog from "@/components/ConfirmPluginDialog";
import Pager from "@/components/Pager";
import PlaylistInfoCard from "@/components/PlaylistInfoCard";
import Spinner from "@/components/Spinner";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePagination from "@/hooks/usePagination";
import usePlugins from "@/hooks/usePlugins";
import { Channel, PageInfo } from "@/plugintypes";

const ChannelPage: React.FC = () => {
  const { pluginId, apiId } = Route.useParams();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const state = useRouterState({ select: (s) => s.location.state });
  const [isLive, setIsLive] = React.useState<boolean>();
  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);
  const [channel, setChannel] = React.useState<Channel | undefined>(
    state.channel
  );
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

export const Route = createFileRoute("/plugins/$pluginId/channels/$apiId/")({
  component: ChannelPage,
});
