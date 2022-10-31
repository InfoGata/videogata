import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import useVideoMenu from "../hooks/useVideoMenu";
import { usePlugins } from "../PluginsContext";
import { FilterInfo, PageInfo } from "../plugintypes";
import Pager from "./Pager";
import VideoCards from "./VideoCards";
import Filtering from "./Filtering";

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

  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

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

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {!!initialFilter && (
        <Filtering filters={initialFilter} setFilters={setFilters} />
      )}
      <VideoCards videos={query.data || []} openMenu={openMenu} />
      <Pager
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </>
  );
};

export default VideoSearchResults;
