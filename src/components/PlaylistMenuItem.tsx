import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { PlaylistAdd } from "@mui/icons-material";
import React from "react";
import { PlaylistInfo, Video } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { addPlaylistVideos } from "../store/reducers/playlistReducer";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";

interface PlaylistMenuItemProps {
  playlist: PlaylistInfo;
  videos: Video[];
  closeMenu: () => void;
  title: string;
}

const PlaylistMenuItem: React.FC<PlaylistMenuItemProps> = (props) => {
  const { playlist, closeMenu, videos, title } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const addToPlaylist = () => {
    if (playlist.id) {
      dispatch(addPlaylistVideos(playlist, videos));
      enqueueSnackbar(
        t("addedVideosToPlaylist", {
          playlistName: playlist.name,
          count: videos.length,
        })
      );
    }
    closeMenu();
  };
  return (
    <MenuItem onClick={addToPlaylist}>
      <ListItemIcon>
        <PlaylistAdd />
      </ListItemIcon>
      <ListItemText primary={title} />
    </MenuItem>
  );
};

export default PlaylistMenuItem;
