import {
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { canonicalizePluginUrl, pluginIdParams } from "@/lib/plugin-route";
import PluginNotInstalled from "@/components/Plugins/PluginNotInstalled";
import ChannelSearchInput from "@/components/ChannelSearchInput";
import HomeVideoCard from "@/components/HomeVideoCard";
import VideoContainer from "@/components/VideoContainer";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import ConfirmPluginDialog from "@/components/ConfirmPluginDialog";
import Pager from "@/components/Pager";
import PlaylistInfoCard from "@/components/PlaylistInfoCard";
import Spinner from "@/components/Spinner";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePagination from "@/hooks/usePagination";
import usePlugins from "@/hooks/usePlugins";
import { Channel, PageInfo } from "@/plugintypes";
import { z } from "zod";

const ChannelPage: React.FC = () => {
  const { pluginId, apiId } = Route.useParams();
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const state = useRouterState({ select: (s) => s.location.state });
  const [isLive, setIsLive] = React.useState<boolean>();
  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const {
    page,
    hasNextPage,
    hasPreviousPage,
    onPreviousPage,
    onNextPage,
    resetPage,
  } = usePagination(currentPage);
  const [channel, setChannel] = React.useState<Channel | undefined>(
    state.channel,
  );
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const [hasChannelSearch, setHasChannelSearch] = React.useState(false);
  React.useEffect(() => {
    const getHasChannelSearch = async () => {
      if (plugin) {
        setHasChannelSearch(await plugin.hasDefined.onSearchChannelVideos());
      }
    };
    getHasChannelSearch();
  }, [plugin]);

  const getChannelVideos = async () => {
    if (!plugin) return [];

    if (q && (await plugin.hasDefined.onSearchChannelVideos())) {
      const searchResult = await plugin.remote.onSearchChannelVideos({
        apiId: apiId,
        query: q,
        pageInfo: page,
      });
      setCurrentPage(searchResult.pageInfo);
      return searchResult.items;
    }

    if (await plugin.hasDefined.onGetChannelVideos()) {
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

  const query = useQuery({
    queryKey: ["channelVideos", pluginId, apiId, q, page],
    queryFn: getChannelVideos,
    enabled: pluginsLoaded && !!plugin,
  });

  const onSearch = (searchQuery: string) => {
    resetPage();
    navigate({
      to: "/s/$pluginId/channels/$apiId",
      params: { pluginId, apiId },
      search: { q: searchQuery || undefined },
      replace: true,
    });
  };

  const videoCards = query.data?.map((v) => {
    return <HomeVideoCard key={v.apiId} video={v} />;
  });

  if (pluginsLoaded && !plugin && !pendingPlugin && !isLoading) {
    return <PluginNotInstalled />;
  }

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
      {hasChannelSearch && (
        <ChannelSearchInput searchQuery={q ?? ""} onSearch={onSearch} />
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

// Optional rather than defaulted, so a channel url without a search stays free
// of an empty `?q=`.
const channelSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/s/$pluginId/channels/$apiId/")({
  component: ChannelPage,
  params: pluginIdParams<{ apiId: string }>(),
  validateSearch: channelSearchSchema,
  beforeLoad: canonicalizePluginUrl,
});
