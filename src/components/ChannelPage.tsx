import { PlaylistAdd } from "@mui/icons-material";
import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import React from "react";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import usePagination from "../hooks/usePagination";
import useVideoMenu from "../hooks/useVideoMenu";
import { usePlugins } from "../PluginsContext";
import { Channel, PageInfo } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistInfoCard from "./PlaylistInfoCard";
import PlaylistMenuItem from "./PlaylistMenuItem";
import VideoCards from "./VideoCards";

const ChannelPage: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
  const plugin = plugins.find((p) => p.id === pluginId);
  const location = useLocation();
  const state = location.state as Channel | null;
  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);
  const [channel, setChannel] = React.useState<Channel | null>(state);
  const { closeMenu, openMenu, anchorEl, menuVideo } = useVideoMenu();
  const playlists = useAppSelector((state) => state.playlist.playlists);

  const addMenuVideoToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
    closeMenu();
  };

  const getChannelVideos = async () => {
    if (plugin && (await plugin.hasDefined.onGetChannelVideos())) {
      const channelInfo = await plugin.remote.onGetChannelVideos({
        apiId: apiId,
        page,
      });

      if (channelInfo.channel) {
        setChannel(channelInfo.channel);
      }
      channelInfo.items.forEach((v) => {
        v.id = nanoid();
      });
      setCurrentPage(channelInfo.pageInfo);
      return channelInfo.items;
    }
    return [];
  };

  const query = useQuery(
    ["pluginplaylist", pluginId, apiId, page],
    getChannelVideos,
    {
      enabled: pluginsLoaded,
    }
  );

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {channel && (
        <PlaylistInfoCard name={channel.name || ""} images={channel.images} />
      )}
      <VideoCards videos={query?.data || []} openMenu={openMenu} />
      <Grid>
        {hasPreviousPage && <Button onClick={onPreviousPage}>Previous</Button>}
        {hasNextPage && <Button onClick={onNextPage}>Next</Button>}
      </Grid>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={addMenuVideoToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary="Add To New Playlist" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            videos={menuVideo ? [menuVideo] : []}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        videos={menuVideo ? [menuVideo] : []}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
      />
    </>
  );
};

export default ChannelPage;
