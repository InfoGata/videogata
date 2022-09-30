import { PlaylistAdd } from "@mui/icons-material";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import React from "react";
import AddPlaylistDialog from "./components/AddPlaylistDialog";
import PlaylistMenuItem from "./components/PlaylistMenuItem";
import { PlaylistInfo, Video } from "./plugintypes";

export interface VideoMenuInterface {
  openVideoMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    video: Video
  ) => void;
  setPlaylists: React.Dispatch<React.SetStateAction<PlaylistInfo[]>>;
  setListElements: React.Dispatch<React.SetStateAction<JSX.Element[]>>;
  menuVideo: Video | undefined;
  closeMenu: () => void;
}

const VideoMenuContext = React.createContext<VideoMenuInterface>(undefined!);

export const VideoMenuProvider: React.FC = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [playlists, setPlaylists] = React.useState<PlaylistInfo[]>([]);
  const [listElements, setListElements] = React.useState<JSX.Element[]>([]);
  const [menuVideo, setMenuVideo] = React.useState<Video>();
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closeMenu = () => setAnchorEl(null);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);

  const openVideoMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    video: Video
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setMenuVideo(video);
  };

  const addMenuVideoToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
    closeMenu();
  };

  const defaultContext: VideoMenuInterface = {
    menuVideo,
    openVideoMenu,
    closeMenu,
    setPlaylists,
    setListElements,
  };
  return (
    <VideoMenuContext.Provider value={defaultContext}>
      {props.children}
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        {listElements}
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
            namePrefix="Add to "
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        videos={menuVideo ? [menuVideo] : []}
        handleClose={closePlaylistDialog}
        open={playlistDialogOpen}
      />
    </VideoMenuContext.Provider>
  );
};

export default VideoMenuContext;
