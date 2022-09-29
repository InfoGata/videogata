import { PlaylistAdd } from "@mui/icons-material";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Backdrop,
  CircularProgress,
  Button,
  Grid,
} from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import usePagination from "../hooks/usePagination";
import useVideoMenu from "../hooks/useVideoMenu";
import { usePlugins } from "../PluginsContext";
import { PageInfo } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import VideoCards from "./VideoCards";

interface VideoSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
}

const VideoSearchResults: React.FC<VideoSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage } = props;
  const { plugins } = usePlugins();
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
  const plugin = plugins.find((p) => p.id === pluginId);
  const { closeMenu, openMenu, anchorEl, menuVideo } = useVideoMenu();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const [currentPage, setCurrentPage] = React.useState<PageInfo | undefined>(
    initialPage
  );

  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const search = async () => {
    if (plugin && (await plugin.hasDefined.onSearchVideos())) {
      const searchTracks = await plugin.remote.onSearchVideos({
        query: searchQuery,
        page: page,
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

  const addMenuVideoToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
    closeMenu();
  };

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <VideoCards videos={query.data || []} openMenu={openMenu} />
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

export default VideoSearchResults;
