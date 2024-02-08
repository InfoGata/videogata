import { List } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import ChannelSearchResult from "../components/ChannelSearchResult";
import Pager from "../components/Pager";
import Spinner from "../components/Spinner";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import { PageInfo, UserChannelRequest } from "../plugintypes";

const UserPluginChannels: React.FC = () => {
  const { plugins, pluginsLoaded } = usePlugins();
  const { pluginId } = useParams<"pluginId">();
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

  const query = useQuery(["userchannels", pluginId, page], getUserChannels, {
    enabled: pluginsLoaded && !!plugin,
  });

  return (
    <>
      <Spinner open={query.isLoading} />
      <List>
        {query.data?.map((channel) => (
          <ChannelSearchResult
            key={channel.apiId}
            channel={channel}
            pluginId={pluginId || ""}
          />
        ))}
      </List>
      <Pager
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </>
  );
};
export default UserPluginChannels;
