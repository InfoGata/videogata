import React from "react";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import Pager from "../components/Pager";
import PlaylistInfoCard from "../components/PlaylistInfoCard";
import PlaylistMenu from "../components/PlaylistMenu";
import Spinner from "../components/Spinner";
import VideoList from "../components/VideoList";
import useFindPlugin from "../hooks/useFindPlugin";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import useSelected from "../hooks/useSelected";
import { PageInfo, PlaylistInfo } from "../plugintypes";
import { useAppSelector } from "../store/hooks";

const PluginPlaylist: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const location = useLocation();
  const state = location.state as PlaylistInfo | null;
  const [playlistInfo, setPlaylistInfo] = React.useState<PlaylistInfo | null>(
    state
  );
  const params = new URLSearchParams(location.search);
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const getPlaylistVideos = async () => {
    if (plugin && (await plugin.hasDefined.onGetPlaylistVideos())) {
      const t = await plugin.remote.onGetPlaylistVideos({
        apiId: apiId,
        isUserPlaylist: params.has("isuserplaylist"),
        pageInfo: page,
      });

      if (t.playlist) {
        setPlaylistInfo(t.playlist);
      }
      setCurrentPage(t.pageInfo);
      return t.items;
    }
    return [];
  };

  const query = useQuery(
    ["pluginplaylist", pluginId, apiId, page],
    getPlaylistVideos,
    {
      enabled: pluginsLoaded && !!plugin,
    }
  );
  const videoList = query.data ?? [];
  const { onSelect, onSelectAll, isSelected, selected } =
    useSelected(videoList);

  return (
    <>
      <Spinner open={query.isLoading || isLoading} />
      {playlistInfo && (
        <PlaylistInfoCard
          name={playlistInfo.name || ""}
          images={playlistInfo.images}
        />
      )}
      <PlaylistMenu
        videoList={videoList}
        selected={selected}
        playlists={playlists}
      />
      <VideoList
        videos={query?.data || []}
        onSelect={onSelect}
        isSelected={isSelected}
        onSelectAll={onSelectAll}
        selected={selected}
        dragDisabled={true}
      />
      <Pager
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </>
  );
};

export default PluginPlaylist;
