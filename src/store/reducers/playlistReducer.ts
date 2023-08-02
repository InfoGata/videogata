import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { db } from "../../database";
import { Playlist, PlaylistInfo, Video } from "../../plugintypes";
import { mergeVideos } from "../../utils";
import { AppThunk } from "../store";

interface PlaylistState {
  playlists: PlaylistInfo[];
}

const initialState: PlaylistState = {
  playlists: [],
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    setPlaylists(state, action: PayloadAction<PlaylistInfo[]>) {
      return {
        ...state,
        playlists: action.payload,
      };
    },
    addPlaylist(state, action: PayloadAction<PlaylistInfo>) {
      return {
        ...state,
        playlists: [...state.playlists, action.payload],
      };
    },
    deletePlaylist(state, action: PayloadAction<PlaylistInfo>) {
      return {
        ...state,
        playlists: state.playlists.filter((p) => p.id !== action.payload.id),
      };
    },
    updatePlaylist(state, action: PayloadAction<PlaylistInfo>) {
      return {
        ...state,
        playlists: state.playlists.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    },
  },
});

const playlistToPlaylistInfo = (playlist: Playlist): PlaylistInfo => ({
  id: playlist.id,
  name: playlist.name,
  images: playlist.images,
});

export const initializePlaylists = (): AppThunk => async (dispatch) => {
  const playlists = await db.playlists.toArray();
  const info = playlists.map(playlistToPlaylistInfo);
  dispatch(playlistSlice.actions.setPlaylists(info));
};

export const addPlaylist =
  (playlist: Playlist): AppThunk =>
  async (dispatch) => {
    const id = nanoid();
    playlist.id = id;
    await db.playlists.add(playlist);
    const info: PlaylistInfo = playlistToPlaylistInfo(playlist);
    dispatch(playlistSlice.actions.addPlaylist(info));
  };

export const addPlaylists =
  (playlists: Playlist[]): AppThunk =>
  async (dispatch) => {
    await db.playlists.bulkPut(playlists);
    const newPlaylists = await db.playlists.toArray();
    const info = newPlaylists.map(playlistToPlaylistInfo);
    dispatch(playlistSlice.actions.setPlaylists(info));
  };

export const deletePlaylist =
  (playlist: PlaylistInfo): AppThunk =>
  async (dispatch) => {
    if (playlist.id) {
      await db.playlists.delete(playlist.id);
      dispatch(playlistSlice.actions.deletePlaylist(playlist));
    }
  };

export const setPlaylistVideos =
  (playlistInfo: PlaylistInfo, videos: Video[]): AppThunk =>
  async (_dispatch) => {
    const newPlaylist = { ...playlistInfo, videos };
    await db.playlists.put(newPlaylist);
  };

export const addPlaylistVideos =
  (playlistInfo: PlaylistInfo, videos: Video[]): AppThunk =>
  async (_dispatch) => {
    videos.forEach((v) => {
      if (!v.id) {
        v.id = nanoid();
      }
    });
    const playlist = await db.playlists.get(playlistInfo.id || "");
    if (playlist) {
      const newVideos = mergeVideos(playlist.videos, videos);
      playlist.videos = newVideos;
      await db.playlists.put(playlist);
    }
  };

export const updatePlaylist =
  (playlistInfo: PlaylistInfo): AppThunk =>
  async (dispatch) => {
    if (playlistInfo.id) {
      const playlist = await db.playlists.get(playlistInfo.id);
      if (playlist) {
        const newPlaylist: Playlist = {
          ...playlistInfo,
          videos: playlist.videos,
        };
        await db.playlists.put(newPlaylist);
        dispatch(playlistSlice.actions.updatePlaylist(playlistInfo));
      }
    }
  };

export default playlistSlice.reducer;
