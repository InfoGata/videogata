import React from "react";
import { useQuery } from "@tanstack/react-query";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import { FilterInfo, PageInfo } from "../plugintypes";
import Filtering from "./Filtering";
import HomeVideoCard from "./HomeVideoCard";
import Pager from "./Pager";
import Spinner from "./Spinner";
import VideoContainer from "./VideoContainer";

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
    return [];
  };

  const filteredKey = filters?.filters.map((f) => ({
    id: f.id,
    value: f.value,
  }));
  const query = useQuery({
    queryKey: ["searchVideos", pluginId, searchQuery, page, filteredKey],
    queryFn: search,
    staleTime: 60 * 1000,
  });

  const applyFilters = (filters: FilterInfo) => {
    setFilters(filters);
    resetPage();
  };

  const videoCards = query.data?.map((v) => {
    return <HomeVideoCard key={v.apiId} video={v} />;
  });

  return (
    <>
      <Spinner open={query.isLoading} />
      {!!initialFilter && (
        <Filtering filters={initialFilter} setFilters={applyFilters} />
      )}
      <VideoContainer>{videoCards}</VideoContainer>
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
