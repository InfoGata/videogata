import { MoreHoriz, PlaylistAdd } from "@mui/icons-material";
import {
  Backdrop,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import useFindPlugin from "../hooks/useFindPlugin";
import usePagination from "../hooks/usePagination";
import useSelected from "../hooks/useSelected";
import useVideoMenu from "../hooks/useVideoMenu";
import { usePlugins } from "../PluginsContext";
import { PageInfo, PlaylistInfo, Video } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import AddPlaylistDialog from "./AddPlaylistDialog";
import ConfirmPluginDialog from "./ConfirmPluginDialog";
import Pager from "./Pager";
import PlaylistInfoCard from "./PlaylistInfoCard";
import PlaylistMenuItem from "./PlaylistMenuItem";
import VideoList from "./VideoList";

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
  const [playlistDialogVideos, setPlaylistDialogVideos] = React.useState<
    Video[]
  >([]);

  const { t } = useTranslation();
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
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

  const selectedVideos = videoList.filter((v) => selected.has(v.id ?? ""));

  const addSelectedToNewPlaylist = () => {
    setPlaylistDialogVideos(selectedVideos);
    setPlaylistDialogOpen(true);
    closeQueueMenu();
  };

  const addToNewPlaylist = () => {
    setPlaylistDialogVideos(videoList);
    setPlaylistDialogOpen(true);
    closeQueueMenu();
  };

  return (
    <>
      <Backdrop open={query.isLoading || isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {playlistInfo && (
        <PlaylistInfoCard
          name={playlistInfo.name || ""}
          images={playlistInfo.images}
        />
      )}

      <IconButton onClick={openQueueMenu}>
        <MoreHoriz fontSize="large" />
      </IconButton>
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
      <Menu
        open={Boolean(queueMenuAnchorEl)}
        onClose={closeQueueMenu}
        anchorEl={queueMenuAnchorEl}
      >
        <MenuItem onClick={addToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary={t("addVideosToNewPlaylist")} />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            videos={videoList}
            closeMenu={closeQueueMenu}
            title={t("addVideosToPlaylist", { playlistName: p.name })}
          />
        ))}
        {selected.size > 0 && [
          <Divider key="divider" />,
          <MenuItem onClick={addSelectedToNewPlaylist} key="selected">
            <ListItemIcon>
              <PlaylistAdd />
            </ListItemIcon>
            <ListItemText primary={t("addSelectedToNewPlaylist")} />
          </MenuItem>,
          playlists.map((p) => (
            <PlaylistMenuItem
              key={p.id}
              playlist={p}
              videos={selectedVideos}
              closeMenu={closeQueueMenu}
              title={t("addSelectedToPlaylist", { playlistName: p.name })}
            />
          )),
        ]}
      </Menu>
      <AddPlaylistDialog
        videos={playlistDialogVideos}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
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
