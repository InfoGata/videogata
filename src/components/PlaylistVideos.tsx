import {
  Backdrop,
  CircularProgress,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import useVideoMenu from "../hooks/useVideoMenu";
import { Playlist, Video } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { db } from "../database";
import { Delete, Edit, MoreHoriz, UploadFile } from "@mui/icons-material";
import {
  addPlaylistVideos,
  setPlaylistVideos,
} from "../store/reducers/playlistReducer";
import VideoList from "./VideoList";
import { useTranslation } from "react-i18next";
import useSelected from "../hooks/useSelected";
import SelectVideoListPlugin from "./SelectVideoListPlugin";
import EditPlaylistDialog from "./EditPlaylistDialog";
import PlaylistMenu from "./PlaylistMenu";
import ImportDialog from "./ImportDialog";
import { useLiveQuery } from "dexie-react-hooks";

const PlaylistVideos: React.FC = () => {
  const { playlistId } = useParams<"playlistId">();

  const playlistInfo = useAppSelector((state) =>
    state.playlist.playlists.find((p) => p.id === playlistId)
  );
  const playlists = useAppSelector((state) =>
    state.playlist.playlists.filter((p) => p.id !== playlistId)
  );
  const [openEditMenu, setOpenEditMenu] = React.useState(false);
  const playlist = useLiveQuery(
    () => db.playlists.get(playlistId || ""),
    [playlistId],
    false
  );
  const videos = (playlist && playlist?.videos) || [];
  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(videos || []);

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };
  const closeQueueMenu = () => setQueueMenuAnchorEl(null);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  const getListItems = (video?: Video) => {
    const deleteClick = async () => {
      if (playlist && video) {
        const newVideolist = videos.filter((t) => t.id !== video.id);
        dispatch(setPlaylistVideos(playlist, newVideolist));
      }
    };

    return [
      <MenuItem onClick={deleteClick} key="delete">
        <ListItemIcon>
          <Delete />
        </ListItemIcon>
        <ListItemText primary={t("delete")} />
      </MenuItem>,
    ];
  };

  const clearSelectedItems = async () => {
    if (playlist) {
      const newVideoList = videos.filter((t) => !selected.has(t.id ?? ""));
      dispatch(setPlaylistVideos(playlist, newVideoList));
    }
    closeQueueMenu();
  };

  const selectedMenuItems = [
    <MenuItem onClick={clearSelectedItems} key="clear">
      <ListItemIcon>
        <Delete />
      </ListItemIcon>
      <ListItemText primary={t("deleteSelectedVideos")} />
    </MenuItem>,
  ];

  const { openMenu } = useVideoMenu({
    playlists,
    getListItems,
  });

  const onEditMenuClose = () => {
    setOpenEditMenu(false);
  };

  const onDragOver = (newVideoList: Video[]) => {
    if (playlist) {
      dispatch(setPlaylistVideos(playlist, newVideoList));
    }
  };

  const onEditMenuOpen = () => {
    setOpenEditMenu(true);
  };

  const openImportDialog = () => {
    setImportDialogOpen(true);
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
  };

  const onImport = (item: Video[] | Playlist) => {
    if (playlist && Array.isArray(item)) {
      dispatch(addPlaylistVideos(playlist, item));
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

  return (
    <>
      <Backdrop open={playlist === false}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {playlist ? (
        <>
          <Grid sx={{ display: "flex" }}>
            <Typography variant="h3">{playlistInfo?.name}</Typography>
            <IconButton onClick={onEditMenuOpen}>
              <Edit />
            </IconButton>
          </Grid>
          <IconButton onClick={openQueueMenu}>
            <MoreHoriz fontSize="large" />
          </IconButton>
          <PlaylistMenu
            videoList={videos}
            selected={selected}
            playlists={playlists}
            anchorElement={queueMenuAnchorEl}
            onClose={closeQueueMenu}
            selectedMenuItems={selectedMenuItems}
            menuItems={menuItems}
          />
          <SelectVideoListPlugin videoList={videos} setSelected={setSelected} />
          <VideoList
            videos={videos}
            openMenu={openMenu}
            playlistId={playlistId}
            onDragOver={onDragOver}
            onSelect={onSelect}
            isSelected={isSelected}
            onSelectAll={onSelectAll}
            selected={selected}
          />
          <EditPlaylistDialog
            open={openEditMenu}
            playlist={playlist}
            handleClose={onEditMenuClose}
          />
          <ImportDialog
            open={importDialogOpen}
            handleClose={closeImportDialog}
            parseType="video"
            onSuccess={onImport}
          />
        </>
      ) : (
        <>{playlist !== false && <Typography>{t("notFound")}</Typography>}</>
      )}
    </>
  );
};

export default PlaylistVideos;
