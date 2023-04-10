import React from "react";
import { useLocation, useParams } from "react-router-dom";
import VideoPlayer from "./VideoPlayer";
import { Video } from "../plugintypes";
import PluginPlayer from "./PluginPlayer";
import { db } from "../database";
import PluginVideoPlaylist from "./PluginVideoPlaylist";
import PluginVideoInfo from "./PluginVideoInfo";
import { Backdrop, CircularProgress, Grid } from "@mui/material";
import PluginVideoComments from "./PluginVideoComments";
import RecommendedVideos from "./RecommendVideos";
import ConfirmPluginDialog from "./ConfirmPluginDialog";
import useFindPlugin from "../hooks/useFindPlugin";
import usePlugins from "../hooks/usePlugins";

const PluginVideo: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const playlistId = params.get("playlistId") || "";
  const videoId = params.get("videoId") || "";
  const { plugins, pluginsLoaded } = usePlugins();
  const [video, setVideo] = React.useState<Video>();
  const [usePlayer, setUsePlayer] = React.useState(false);
  const plugin = plugins.find((p) => p.id === pluginId);
  const [playlistVideos, setPlaylistVideos] = React.useState<Video[]>();
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  React.useEffect(() => {
    const getVideo = async () => {
      if (pluginsLoaded && plugin && apiId) {
        if (plugin.hasPlayer) {
          setUsePlayer(true);
          if (await plugin.hasDefined.onUsePlayer()) {
            setUsePlayer(await plugin.remote.onUsePlayer());
          }
        }
        if (await plugin.hasDefined.onGetVideo()) {
          const video = await plugin.remote.onGetVideo({ apiId });
          setVideo(video);
        }
      }
    };

    getVideo();
  }, [pluginsLoaded, plugin, apiId]);

  React.useEffect(() => {
    const getPlaylistVideos = async () => {
      if (playlistId) {
        const playlist = await db.playlists.get(playlistId);
        setPlaylistVideos(playlist?.videos);
      } else {
        setPlaylistVideos(undefined);
      }
    };
    getPlaylistVideos();
  }, [playlistId]);

  return (
    <>
      <Backdrop open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {video && !usePlayer ? <VideoPlayer video={video} /> : null}
      {usePlayer && <PluginPlayer apiId={apiId} plugin={plugin} />}
      {video && <PluginVideoInfo video={video} />}
      {playlistVideos && (
        <PluginVideoPlaylist
          videos={playlistVideos}
          playlistId={playlistId}
          videoId={videoId}
        />
      )}
      <Grid container>
        <Grid item xs={9}>
          <PluginVideoComments
            apiId={apiId || ""}
            pluginId={video?.pluginId || ""}
          />
        </Grid>
        <RecommendedVideos
          pluginId={video?.pluginId || ""}
          videos={video?.recommendedVideos || []}
        />
      </Grid>
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </>
  );
};

export default PluginVideo;
