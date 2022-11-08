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
import { PlaylistInfo, Video } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { db } from "../database";
import { Delete, Edit, MoreHoriz } from "@mui/icons-material";
import { setPlaylistVideos } from "../store/reducers/playlistReducer";
import VideoList from "./VideoList";
import { useTranslation } from "react-i18next";
import useSelected from "../hooks/useSelected";
import SelectVideoListPlugin from "./SelectVideoListPlugin";
import EditPlaylistDialog from "./EditPlaylistDialog";
import PlaylistMenu from "./PlaylistMenu";

const PlaylistVideos: React.FC = () => {
  const { playlistId } = useParams<"playlistId">();

  const playlistInfo = useAppSelector((state) =>
    state.playlist.playlists.find((p) => p.id === playlistId)
  );
  const [videos, setVideos] = React.useState<Video[]>([]);
  const playlists = useAppSelector((state) =>
    state.playlist.playlists.filter((p) => p.id !== playlistId)
  );
  const [openEditMenu, setOpenEditMenu] = React.useState(false);
  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(videos || []);

  const [loaded, setLoaded] = React.useState(false);
  const [playlist, setPlaylist] = React.useState<PlaylistInfo | undefined>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [queueMenuAnchorEl, setQueueMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const openQueueMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setQueueMenuAnchorEl(event.currentTarget);
  };
  const closeQueueMenu = () => setQueueMenuAnchorEl(null);

  const deleteClick = async () => {
    if (playlist && menuVideo) {
      const newVideolist = videos.filter((t) => t.id !== menuVideo.id);
      dispatch(setPlaylistVideos(playlist, newVideolist));
      setVideos(newVideolist);
    }
  };

  const listItems = [
    <MenuItem onClick={deleteClick} key="delete">
      <ListItemIcon>
        <Delete />
      </ListItemIcon>
      <ListItemText primary={t("delete")} />
    </MenuItem>,
  ];

  const clearSelectedItems = async () => {
    if (playlist) {
      const newVideoList = videos.filter((t) => !selected.has(t.id ?? ""));
      dispatch(setPlaylistVideos(playlist, newVideoList));
      setVideos(newVideoList);
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

  const { openMenu, menuVideo } = useVideoMenu({
    playlists,
    listItems,
  });

  const onEditMenuClose = () => {
    setOpenEditMenu(false);
  };

  React.useEffect(() => {
    const getPlaylist = async () => {
      if (playlistId) {
        const playlist = await db.playlists.get(playlistId);
        setPlaylist(await db.playlists.get(playlistId));
        setVideos(playlist?.videos ?? []);
        setLoaded(true);
      }
    };
    getPlaylist();
  }, [playlistId]);

  const onDragOver = (newVideoList: Video[]) => {
    if (playlist) {
      dispatch(setPlaylistVideos(playlist, newVideoList));
      setVideos(newVideoList);
    }
  };

  const onEditMenuOpen = () => {
    setOpenEditMenu(true);
  };

  return (
    <>
      <Backdrop open={!loaded}>
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
        </>
      ) : (
        <>{loaded && <Typography>{t("notFound")}</Typography>}</>
      )}
    </>
  );
};

export default PlaylistVideos;
