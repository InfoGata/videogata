import HomeVideoCard from "@/components/HomeVideoCard";
import { Button } from "@/components/ui/button";
import { UploadFile } from "@mui/icons-material";
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import { MoreHorizontalIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import ImportDialog from "../components/ImportDialog";
import PlaylistMenu from "../components/PlaylistMenu";
import { db } from "../database";
import useVideoMenu from "../hooks/useVideoMenu";
import { Playlist, Video } from "../plugintypes";
import { useAppSelector } from "../store/hooks";

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
    return <></>;
  }

  const videoCards = videos.map((v) => {
    const openVideoMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      openMenu(event, v);
    };

    return <HomeVideoCard key={v.apiId} video={v} openMenu={openVideoMenu} />;
  });

  return (
    <>
      <Button size="icon" variant="ghost" onClick={openFavoritesMenu}>
        <MoreHorizontalIcon fontSize="large" />
      </Button>
      {videos && videos.length > 0 ? (
        <div className="grid grid-cols-4 gap-5">{videoCards}</div>
      ) : (
        <h3>{t("noFavoriteVideos")}</h3>
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
