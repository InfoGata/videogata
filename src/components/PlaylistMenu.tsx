import { PlaylistAdd } from "@mui/icons-material";
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { PlaylistInfo, Video } from "../plugintypes";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";

interface PlaylistMenuProps {
  playlists: PlaylistInfo[];
  selected: Set<string>;
  videoList: Video[];
  selectedMenuItems?: JSX.Element[];
  anchorElement: HTMLElement | null;
  onClose: () => void;
}

const PlaylistMenu: React.FC<PlaylistMenuProps> = (props) => {
  const {
    playlists,
    selected,
    videoList,
    selectedMenuItems,
    anchorElement,
    onClose,
  } = props;
  const { t } = useTranslation();

  const [playlistDialogVideos, setPlaylistDialogVideos] = React.useState<
    Video[]
  >([]);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);

  const selectedVideos = videoList.filter((t) => selected.has(t.id ?? ""));

  const addSelectedToNewPlaylist = () => {
    setPlaylistDialogVideos(selectedVideos);
    setPlaylistDialogOpen(true);
    onClose();
  };

  const addToNewPlaylist = () => {
    setPlaylistDialogVideos(videoList);
    setPlaylistDialogOpen(true);
    onClose();
  };

  return (
    <>
      <Menu
        open={Boolean(anchorElement)}
        onClose={onClose}
        anchorEl={anchorElement}
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
            closeMenu={onClose}
            title={t("addVideosToPlaylist", { playlistName: p.name })}
          />
        ))}
        {selected.size > 0 && [
          <Divider key="divider" />,
          selectedMenuItems,
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
              closeMenu={onClose}
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
    </>
  );
};

export default PlaylistMenu;
