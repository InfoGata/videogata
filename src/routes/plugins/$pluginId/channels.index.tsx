import { createFileRoute } from "@tanstack/react-router";
import ChannelListItem from "@/components/ChannelListItem";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import Pager from "@/components/Pager";
import Spinner from "@/components/Spinner";
import usePagination from "@/hooks/usePagination";
import usePlugins from "@/hooks/usePlugins";
import { PageInfo, UserChannelRequest } from "@/plugintypes";

const UserPluginChannels: React.FC = () => {
  const { plugins, pluginsLoaded } = usePlugins();
  const { pluginId } = Route.useParams();
  const plugin = plugins.find((p) => p.id === pluginId);
  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const getUserChannels = async () => {
    if (plugin && (await plugin.hasDefined.onGetUserChannels())) {
      const request: UserChannelRequest = {};
      const c = await plugin.remote.onGetUserChannels(request);
      setCurrentPage(c.pageInfo);
      return c.items;
    }
    return [];
  };

  const query = useQuery({
    queryKey: ["userchannels", pluginId, page],
    queryFn: getUserChannels,
    enabled: pluginsLoaded && !!plugin,
  });

  const channelCards = query.data?.map((c) => {
    return <ChannelListItem channel={c} key={c.id} />;
  });

  return (
    <>
      <Spinner open={query.isLoading} />
      <div>{channelCards}</div>
      <Pager
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </>
  );
};

export const Route = createFileRoute("/plugins/$pluginId/channels/")({
  component: UserPluginChannels,
});
