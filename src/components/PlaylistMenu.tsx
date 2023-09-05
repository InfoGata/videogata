import { ArrowRight, PlaylistAdd } from "@mui/icons-material";
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
import { NestedMenuItem } from "mui-nested-menu";

interface PlaylistMenuProps {
  playlists: PlaylistInfo[];
  selected: Set<string>;
  videoList: Video[];
  menuItems?: JSX.Element[];
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
    menuItems,
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
        onClick={onClose}
      >
        {menuItems}
        <MenuItem onClick={addToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary={t("addVideosToNewPlaylist")} />
        </MenuItem>
        {playlists.length > 0 && (
          <NestedMenuItem
            parentMenuOpen={Boolean(anchorElement)}
            label={t("addVideosToPlaylist")}
            rightIcon={<ArrowRight />}
            onClick={(e) => e.stopPropagation()}
          >
            {playlists.map((p) => (
              <PlaylistMenuItem
                key={p.id}
                playlist={p}
                videos={videoList}
                closeMenu={onClose}
                title={p.name ?? ""}
              />
            ))}
          </NestedMenuItem>
        )}
        {selected.size > 0 && [
          <Divider key="divider" />,
          selectedMenuItems,
          <MenuItem onClick={addSelectedToNewPlaylist} key="selected">
            <ListItemIcon>
              <PlaylistAdd />
            </ListItemIcon>
            <ListItemText primary={t("addSelectedToNewPlaylist")} />
          </MenuItem>,
          playlists.length > 0 && (
            <NestedMenuItem
              key="selectednested"
              parentMenuOpen={Boolean(anchorElement)}
              label={t("addSelectedToPlaylist")}
              rightIcon={<ArrowRight />}
              onClick={(e) => e.stopPropagation()}
            >
              {playlists.map((p) => (
                <PlaylistMenuItem
                  key={p.id}
                  playlist={p}
                  videos={selectedVideos}
                  closeMenu={onClose}
                  title={p.name ?? ""}
                />
              ))}
            </NestedMenuItem>
          ),
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
