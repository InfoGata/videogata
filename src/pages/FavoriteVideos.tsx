import { MoreHoriz, UploadFile } from "@mui/icons-material";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { db } from "../database";
import useVideoMenu from "../hooks/useVideoMenu";
import { Playlist, Video } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import ImportDialog from "../components/ImportDialog";
import PlaylistMenu from "../components/PlaylistMenu";
import Spinner from "../components/Spinner";
import VideoCards from "../components/VideoCards";

const FavoriteVideos: React.FC = () => {
  const videos = useLiveQuery(() => db.favoriteVideos.toArray());
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [favoritesMenuAnchorEl, setFavoriteseMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const playlists = useAppSelector((state) => state.playlist.playlists);

  const openFavoritesMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFavoriteseMenuAnchorEl(event.currentTarget);
  };

  const closeFavoritesMenu = () => {
    setFavoriteseMenuAnchorEl(null);
  };

  const { openMenu } = useVideoMenu();

  const openImportDialog = () => {
    setImportDialogOpen(true);
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
  };

  const onImport = async (item: Video[] | Playlist) => {
    if (Array.isArray(item)) {
      await db.favoriteVideos.bulkAdd(item);
      closeImportDialog();
    }
  };

  const menuItems = [
    <MenuItem onClick={openImportDialog} key="import">
      <ListItemIcon>
        <UploadFile />
      </ListItemIcon>
      <ListItemText primary={t("importVideoByUrl")} />
    </MenuItem>,
  ];

  if (!videos) {
    return <Spinner open={true} />;
  }

  return (
    <>
      <IconButton onClick={openFavoritesMenu}>
        <MoreHoriz fontSize="large" />
      </IconButton>
      {videos && videos.length > 0 ? (
        <VideoCards videos={videos || []} openMenu={openMenu} />
      ) : (
        <Typography>{t("noFavoriteVideos")}</Typography>
      )}
      <ImportDialog
        open={importDialogOpen}
        handleClose={closeImportDialog}
        parseType="video"
        onSuccess={onImport}
      />
      <PlaylistMenu
        playlists={playlists}
        videoList={videos ?? []}
        anchorElement={favoritesMenuAnchorEl}
        onClose={closeFavoritesMenu}
        menuItems={menuItems}
      />
    </>
  );
};

export default FavoriteVideos;