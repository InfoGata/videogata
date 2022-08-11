import { Backdrop, CircularProgress, List } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import React from "react";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { PlaylistInfo } from "../plugintypes";
import PlaylistInfoCard from "./PlaylistInfoCard";
import VideoSearchResult from "./VideoSearchResult";

const PluginPlaylist: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { playlistId } = useParams<"playlistId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const location = useLocation();
  const state = location.state as PlaylistInfo | null;
  const [playlistInfo, setPlaylistInfo] = React.useState<PlaylistInfo | null>(
    state
  );
  const params = new URLSearchParams(location.search);

  const getPlaylistVideos = async () => {
    if (plugin && (await plugin.hasDefined.onGetPlaylistVideos())) {
      const t = await plugin.remote.onGetPlaylistVideos({
        apiId: playlistId,
        isUserPlaylist: params.has("isuserplaylist"),
      });

      if (t.playlist) {
        setPlaylistInfo(t.playlist);
      }
      t.items.forEach((t) => {
        t.id = nanoid();
      });
      return t.items;
    }
    return [];
  };

  const query = useQuery(
    ["pluginplaylist", pluginId, playlistId],
    getPlaylistVideos,
    {
      enabled: pluginsLoaded,
    }
  );

  const videoList = query?.data?.map((v) => (
    <VideoSearchResult key={v.apiId} video={v} />
  ));

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {playlistInfo && (
        <PlaylistInfoCard
          name={playlistInfo.name || ""}
          images={playlistInfo.images}
        />
      )}
      <List>{videoList}</List>
    </>
  );
};

export default PluginPlaylist;
