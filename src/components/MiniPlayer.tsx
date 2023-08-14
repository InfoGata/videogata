import { Box } from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import PluginPlayer from "./PluginPlayer";
import VideoPlayer from "./VideoPlayer";
import { useAppSelector } from "../store/hooks";
import usePlugins from "../hooks/usePlugins";
import { useLocation } from "react-router-dom";

const MiniPlayer: React.FC = () => {
  const playerState = useAppSelector((state) => state.player);
  const [usePlayer, setUsePlayer] = React.useState(false);
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === playerState.pluginId);
  const height = 154;
  const width = 274;
  const [video, setVideo] = React.useState<Video>();
  const location = useLocation();
  const useDefaultPlayer =
    location.pathname.endsWith("/live") ||
    location.pathname.endsWith(`/videos/${playerState.apiId}`);
  const useMiniPlayer = useAppSelector((state) => state.settings.useMiniPlayer);

  React.useEffect(() => {
    const getVideo = async () => {
      if (pluginsLoaded && plugin && playerState.apiId) {
        if (plugin.hasPlayer) {
          setUsePlayer(true);
          if (await plugin.hasDefined.onUsePlayer()) {
            setUsePlayer(await plugin.remote.onUsePlayer());
          }
        }
        if (await plugin.hasDefined.onGetVideo()) {
          const video = await plugin.remote.onGetVideo({
            apiId: playerState.apiId,
          });
          setVideo(video);
        }
      }
    };

    getVideo();
  }, [pluginsLoaded, plugin, playerState.apiId]);

  if (!playerState.pluginId) {
    return null;
  }

  if (!useDefaultPlayer && !useMiniPlayer) {
    return null;
  }

  return (
    <Box
      sx={
        useDefaultPlayer
          ? undefined
          : {
              position: "fixed",
              bottom: "32px",
              right: "32px",
              width: `${width}px`,
              height: `${height}px`,
              zIndex: 100,
            }
      }
    >
      {video && !usePlayer ? (
        <VideoPlayer video={video} isMiniPlayer={!useDefaultPlayer} />
      ) : null}
      {usePlayer && (
        <PluginPlayer
          apiId={playerState.apiId}
          channelApiId={playerState.channelApiId}
          plugin={plugin}
          isLive={playerState.isLive}
          isMiniPlayer={!useDefaultPlayer}
        />
      )}
    </Box>
  );
};

export default MiniPlayer;
