import {
  Backdrop,
  CircularProgress,
  Grid,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import useVideoMenu from "../hooks/useVideoMenu";
import { PlaylistInfo, Video } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { db } from "../database";
import { Delete } from "@mui/icons-material";
import PlaylistMenuItem from "./PlaylistMenuItem";
import { setPlaylistVideos } from "../store/reducers/playlistReducer";
import VideoList from "./VideoList";

const PlaylistVideos: React.FC = () => {
  const { playlistId } = useParams<"playlistId">();
  const playlistInfo = useAppSelector((state) =>
    state.playlist.playlists.find((p) => p.id === playlistId)
  );
  const [videos, setVideos] = React.useState<Video[]>([]);
  const { closeMenu, openMenu, anchorEl, menuVideo } = useVideoMenu();

  const playlists = useAppSelector((state) =>
    state.playlist.playlists.filter((p) => p.id !== playlistId)
  );
  const [loaded, setLoaded] = React.useState(false);
  const [playlist, setPlaylist] = React.useState<PlaylistInfo | undefined>();
  const dispatch = useAppDispatch();

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

  const deleteClick = async () => {
    if (playlist && menuVideo) {
      const newVideolist = videos.filter((t) => t.id !== menuVideo.id);
      dispatch(setPlaylistVideos(playlist, newVideolist));
      setVideos(newVideolist);
    }

    closeMenu();
  };

  const onDragOver = (newVideoList: Video[]) => {
    if (playlist) {
      dispatch(setPlaylistVideos(playlist, newVideoList));
      setVideos(newVideoList);
    }
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
          </Grid>
          <VideoList
            videos={videos}
            openMenu={openMenu}
            playlistId={playlistId}
            onDragOver={onDragOver}
          />
          <Menu
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            anchorEl={anchorEl}
          >
            <MenuItem onClick={deleteClick}>
              <ListItemIcon>
                <Delete />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
            {playlists.map((p) => (
              <PlaylistMenuItem
                key={p.id}
                playlist={p}
                videos={menuVideo ? [menuVideo] : []}
                closeMenu={closeMenu}
                namePrefix="Add video to "
              />
            ))}
          </Menu>
        </>
      ) : (
        <>{loaded && <Typography>Not Found</Typography>}</>
      )}
    </>
  );
};

export default PlaylistVideos;
