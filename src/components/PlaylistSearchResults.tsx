import { List, Backdrop, CircularProgress } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import { usePlugins } from "../PluginsContext";
import { FilterInfo, PageInfo } from "../plugintypes";
import Filtering from "./Filtering";
import Pager from "./Pager";
import PlaylistSearchResult from "./PlaylistSearchResult";

interface PlaylistSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
  initialFilter?: FilterInfo;
}

const PlaylistSearchResults: React.FC<PlaylistSearchResultsProps> = (props) => {
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
        const hasSearch = await plugin.hasDefined.onSearchPlaylists();
        setHasSearch(hasSearch);
      }
    };
    getHasSearch();
  }, [plugin]);

  const search = async () => {
    if (plugin && (await plugin.hasDefined.onSearchPlaylists())) {
      const searchPlaylists = await plugin.remote.onSearchPlaylists({
        query: searchQuery,
        pageInfo: page,
        filterInfo: filters,
      });
      setCurrentPage(searchPlaylists.pageInfo);
      return searchPlaylists.items;
    }
  };

  const filteredKey = filters?.filters.map((f) => ({
    id: f.id,
    value: f.value,
  }));
  const query = useQuery(
    ["searchPlaylists", pluginId, searchQuery, page, filteredKey],
    search,
    { staleTime: 60 * 1000 }
  );

  const playlistList = query.data?.map((playlist) => (
    <PlaylistSearchResult
      key={playlist.apiId}
      playlist={playlist}
      pluginId={pluginId}
    />
  ));

  const applyFilters = (filters: FilterInfo) => {
    setFilters(filters);
    resetPage();
  };

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {!!initialFilter && (
        <Filtering filters={initialFilter} setFilters={applyFilters} />
      )}
      <List>{playlistList}</List>
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

export default PlaylistSearchResults;
