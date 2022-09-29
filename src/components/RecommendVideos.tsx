import { PlaylistAdd } from "@mui/icons-material";
import {
  Grid,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import React from "react";
import useVideoMenu from "../hooks/useVideoMenu";
import { Video } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import VideoCard from "./VideoCard";

interface RecommendedVideosProps {
  videos: Video[];
  pluginId: string;
}

const RecommendedVideos: React.FC<RecommendedVideosProps> = (props) => {
  const { videos, pluginId } = props;
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
  const { closeMenu, openMenu, anchorEl, menuVideo } = useVideoMenu();

  const recommendations = videos.map((v) => (
    <VideoCard
      key={v.apiId}
      pluginId={pluginId}
      video={v}
      openMenu={openMenu}
    />
  ));

  const addMenuVideoToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
    closeMenu();
  };

  return (
    <>
      <Grid item xs={3}>
        {recommendations}
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

export default RecommendedVideos;
