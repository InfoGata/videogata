import { MoreHoriz } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import useFindPlugin from "../hooks/useFindPlugin";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import useSelected from "../hooks/useSelected";
import useVideoMenu from "../hooks/useVideoMenu";
import { PageInfo, PlaylistInfo } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import Pager from "../components/Pager";
import PlaylistInfoCard from "../components/PlaylistInfoCard";
import PlaylistMenu from "../components/PlaylistMenu";
import Spinner from "../components/Spinner";
import VideoList from "../components/VideoList";

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
  const { openMenu } = useVideoMenu();

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

  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };

  const closeQueueMenu = () => setQueueMenuAnchorEl(null);

  return (
    <>
      <Spinner open={query.isLoading || isLoading} />
      {playlistInfo && (
        <PlaylistInfoCard
          name={playlistInfo.name || ""}
          images={playlistInfo.images}
        />
      )}
      <IconButton onClick={openQueueMenu}>
        <MoreHoriz fontSize="large" />
      </IconButton>
      <PlaylistMenu
        videoList={videoList}
        selected={selected}
        playlists={playlists}
        anchorElement={queueMenuAnchorEl}
        onClose={closeQueueMenu}
      />
      <VideoList
        videos={query?.data || []}
        openMenu={openMenu}
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
