import {
  PlaylistAdd,
  Star,
  StarBorder,
  Subscriptions,
} from "@mui/icons-material";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import AddPlaylistDialog from "./components/AddPlaylistDialog";
import PlaylistMenuItem from "./components/PlaylistMenuItem";
import { PlaylistInfo, Video } from "./plugintypes";
import { db } from "./database";
import { useSnackbar } from "notistack";

export interface VideoMenuInterface {
  openVideoMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    video: Video
  ) => Promise<void>;
  setPlaylists: React.Dispatch<React.SetStateAction<PlaylistInfo[]>>;
  setListElements: React.Dispatch<React.SetStateAction<JSX.Element[]>>;
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
  const [isFavorited, setIsFavorited] = React.useState(false);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const openVideoMenu = async (
    event: React.MouseEvent<HTMLButtonElement>,
    video: Video
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setMenuVideo(video);
    if (video.pluginId && video.apiId) {
      const hasFavorite = await db.favoriteVideos.get({
        pluginId: video.pluginId,
        apiId: video.apiId,
      });
      setIsFavorited(!!hasFavorite);
    } else if (video.id) {
      const hasFavorite = await db.favoriteVideos.get(video.id);
      setIsFavorited(!!hasFavorite);
    } else {
      setIsFavorited(false);
    }
  };

  const favoriteTrack = async () => {
    if (menuVideo) {
      await db.favoriteVideos.add(menuVideo);
      enqueueSnackbar(t("addedToFavorites"));
    }
  };

  const removeFavorite = async () => {
    if (menuVideo?.id) {
      await db.favoriteVideos.delete(menuVideo.id);
      enqueueSnackbar(t("removedFromFavorites"));
    }
  };

  const addMenuVideoToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
  };

  const defaultContext: VideoMenuInterface = {
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
        <MenuItem onClick={isFavorited ? removeFavorite : favoriteTrack}>
          <ListItemIcon>{isFavorited ? <StarBorder /> : <Star />}</ListItemIcon>
          <ListItemText
            primary={
              isFavorited ? t("removeFromFavorites") : t("addToFavorites")
            }
          />
        </MenuItem>
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
