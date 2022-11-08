import { PlaylistAdd, Subscriptions } from "@mui/icons-material";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
  const { t } = useTranslation();

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
  };

  const defaultContext: VideoMenuInterface = {
    menuVideo,
    openVideoMenu,
    setPlaylists,
    setListElements,
  };
  return (
    <VideoMenuContext.Provider value={defaultContext}>
      {props.children}
      <Menu
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorEl={anchorEl}
        onClick={closeMenu}
      >
        {menuVideo?.channelApiId && (
          <MenuItem
            component={Link}
            to={`/plugins/${menuVideo?.pluginId}/channels/${menuVideo?.channelApiId}`}
          >
            <ListItemIcon>
              <Subscriptions />
            </ListItemIcon>
            <ListItemText primary={t("goToChannel")} />
          </MenuItem>
        )}
        {listElements}
        <MenuItem onClick={addMenuVideoToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary={t("addToNewPlaylist")} />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            videos={menuVideo ? [menuVideo] : []}
            closeMenu={closeMenu}
            title={t("addToPlaylist", { playlistName: p.name })}
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
