import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import useVideoMenu from "../hooks/useVideoMenu";
import { usePlugins } from "../PluginsContext";
import { PageInfo } from "../plugintypes";
import Pager from "./Pager";
import VideoCards from "./VideoCards";

interface VideoSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
}

const VideoSearchResults: React.FC<VideoSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { openMenu } = useVideoMenu();
  const [currentPage, setCurrentPage] = React.useState<PageInfo | undefined>(
    initialPage
  );

  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const search = async () => {
    if (plugin && (await plugin.hasDefined.onSearchVideos())) {
      const searchTracks = await plugin.remote.onSearchVideos({
        query: searchQuery,
        pageInfo: page,
      });
      setCurrentPage(searchTracks.pageInfo);
      return searchTracks.items;
    }
  };

  const query = useQuery(
    ["searchVideos", pluginId, searchQuery, page],
    search,
    { staleTime: 60 * 1000 }
  );

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
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
