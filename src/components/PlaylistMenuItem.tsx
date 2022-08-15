import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { PlaylistAdd } from "@mui/icons-material";
import React from "react";
import { PlaylistInfo, Video } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { addPlaylistVideos } from "../store/reducers/playlistReducer";

interface PlaylistMenuItemProps {
  playlist: PlaylistInfo;
  videos: Video[];
  closeMenu: () => void;
  namePrefix?: string;
}

const PlaylistMenuItem: React.FC<PlaylistMenuItemProps> = (props) => {
  const { playlist, closeMenu, videos, namePrefix } = props;
  const dispatch = useAppDispatch();

  const addToPlaylist = () => {
    if (playlist.id) {
      dispatch(addPlaylistVideos(playlist, videos));
    }
    closeMenu();
  };
  return (
    <MenuItem onClick={addToPlaylist}>
      <ListItemIcon>
        <PlaylistAdd />
      </ListItemIcon>
      <ListItemText primary={`${namePrefix ?? ""}${playlist.name}`} />
    </MenuItem>
  );
};

export default PlaylistMenuItem;
