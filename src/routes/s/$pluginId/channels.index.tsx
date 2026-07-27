import { createFileRoute } from "@tanstack/react-router";
import {
  canonicalizePluginUrl,
  pluginIdParams,
} from "@/lib/plugin-route";
import PluginNotInstalled from "@/components/Plugins/PluginNotInstalled";
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

  if (pluginsLoaded && !plugin) {
    return <PluginNotInstalled />;
  }

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

export const Route = createFileRoute("/s/$pluginId/channels/")({
  component: UserPluginChannels,
  params: pluginIdParams(),
  beforeLoad: canonicalizePluginUrl,
});
