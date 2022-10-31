import { List, Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import { usePlugins } from "../PluginsContext";
import { FilterInfo, PageInfo } from "../plugintypes";
import ChannelSearchResult from "./ChannelSearchResult";
import Filtering from "./Filtering";
import Pager from "./Pager";

interface PlaylistSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
  initialFilter?: FilterInfo;
}

const ChannelSearchResults: React.FC<PlaylistSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage, initialFilter } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const [filters, setFilters] = React.useState<FilterInfo | undefined>();

  const [currentPage, setCurrentPage] = React.useState<PageInfo | undefined>(
    initialPage
  );
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const search = async () => {
    if (plugin && (await plugin.hasDefined.onSearchChannels())) {
      const searchChannels = await plugin.remote.onSearchChannels({
        query: searchQuery,
        pageInfo: page,
        filterInfo: filters,
      });
      setCurrentPage(searchChannels.pageInfo);
      return searchChannels.items;
    }
  };

  const filteredKey = filters?.filters.map((f) => ({
    id: f.id,
    value: f.value,
  }));
  const query = useQuery(
    ["searchChannels", pluginId, searchQuery, page, filteredKey],
    search,
    { staleTime: 60 * 1000 }
  );

  const channelList = query.data?.map((channel) => (
    <ChannelSearchResult
      key={channel.apiId}
      channel={channel}
      pluginId={pluginId}
    />
  ));

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {!!initialFilter && (
        <Filtering filters={initialFilter} setFilters={setFilters} />
      )}
      <List>{channelList}</List>
      <Pager
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </>
  );
};

export default ChannelSearchResults;
