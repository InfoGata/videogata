import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import { FilterInfo, PageInfo } from "../plugintypes";
import Filtering from "./Filtering";
import Pager from "./Pager";
import Spinner from "./Spinner";
import ChannelListItem from "./ChannelListItem";

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
  const {
    page,
    hasNextPage,
    hasPreviousPage,
    onPreviousPage,
    onNextPage,
    resetPage,
  } = usePagination(currentPage);

  const [hasSearch, setHasSearch] = React.useState(false);
  React.useEffect(() => {
    const getHasSearch = async () => {
      if (plugin) {
        const hasSearch = await plugin.hasDefined.onSearchChannels();
        setHasSearch(hasSearch);
      }
    };
    getHasSearch();
  }, [plugin]);

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

  const channelCards = query.data?.map((c) => {
    return <ChannelListItem channel={c} key={c.apiId} />;
  });

  const applyFilters = (filters: FilterInfo) => {
    setFilters(filters);
    resetPage();
  };

  return (
    <>
      <Spinner open={query.isLoading} />
      {!!initialFilter && (
        <Filtering filters={initialFilter} setFilters={applyFilters} />
      )}
      <div>{channelCards}</div>
      {hasSearch && (
        <Pager
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
        />
      )}
    </>
  );
};

export default ChannelSearchResults;
