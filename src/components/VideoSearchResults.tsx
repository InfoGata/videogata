import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import useVideoMenu from "../hooks/useVideoMenu";
import { FilterInfo, PageInfo } from "../plugintypes";
import Filtering from "./Filtering";
import Pager from "./Pager";
import Spinner from "./Spinner";
import VideoCards from "./VideoCards";

interface VideoSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
  initialFilter?: FilterInfo;
}

const VideoSearchResults: React.FC<VideoSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage, initialFilter } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { openMenu } = useVideoMenu();
  const [currentPage, setCurrentPage] = React.useState<PageInfo | undefined>(
    initialPage
  );
  const [filters, setFilters] = React.useState<FilterInfo | undefined>();

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
        const hasSearch = await plugin.hasDefined.onSearchVideos();
        setHasSearch(hasSearch);
      }
    };
    getHasSearch();
  }, [plugin]);

  const search = async () => {
    if (plugin && (await plugin.hasDefined.onSearchVideos())) {
      const searchVideos = await plugin.remote.onSearchVideos({
        query: searchQuery,
        pageInfo: page,
        filterInfo: filters,
      });
      setCurrentPage(searchVideos.pageInfo);
      return searchVideos.items;
    }
  };

  const filteredKey = filters?.filters.map((f) => ({
    id: f.id,
    value: f.value,
  }));
  const query = useQuery(
    ["searchVideos", pluginId, searchQuery, page, filteredKey],
    search,
    { staleTime: 60 * 1000 }
  );

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
      <VideoCards videos={query.data || []} openMenu={openMenu} />
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

export default VideoSearchResults;
