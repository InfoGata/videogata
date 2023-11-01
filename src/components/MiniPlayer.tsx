import {
  Box,
  Card,
  CardContent,
  IconButton,
  CardActionArea,
  Typography,
} from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import PluginPlayer from "./PluginPlayer";
import VideoPlayer from "./VideoPlayer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import usePlugins from "../hooks/usePlugins";
import { useLocation, Link } from "react-router-dom";
import CancelIcon from "@mui/icons-material/Cancel";
import { closePlayer } from "../store/reducers/playerReducer";

const MiniPlayer: React.FC = () => {
  const playerState = useAppSelector((state) => state.player);
  const [usePlayer, setUsePlayer] = React.useState(false);
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === playerState.pluginId);
  const height = 164;
  const width = 274;
  const [video, setVideo] = React.useState<Video>();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const useDefaultPlayer =
    location.pathname.endsWith("/live") ||
    location.pathname.endsWith(`/videos/${playerState.apiId}`);
  const params = new URLSearchParams(location.search);
  const timeInSeconds = params.has("t")
    ? parseInt(params.get("t") ?? "0", 10)
    : undefined;
  const useMiniPlayer = useAppSelector((state) => state.settings.useMiniPlayer);
  const url = `/plugins/${video?.pluginId}/videos/${video?.apiId}`;

  React.useEffect(() => {
    if (timeInSeconds) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [timeInSeconds]);

  React.useEffect(() => {
    const getVideo = async () => {
      if (pluginsLoaded && plugin) {
        if (plugin.hasPlayer) {
          setUsePlayer(true);
          if (await plugin.hasDefined.onUsePlayer()) {
            setUsePlayer(await plugin.remote.onUsePlayer());
          }
        }
        if (playerState.apiId && !playerState.isLive) {
          if (await plugin.hasDefined.onGetVideo()) {
            const video = await plugin.remote.onGetVideo({
              apiId: playerState.apiId,
            });
            setVideo(video);
          }
        } else if (playerState.channelApiId && playerState.isLive) {
          if (await plugin.hasDefined.onGetLiveVideo()) {
            const video = await plugin.remote.onGetLiveVideo({
              channelApiId: playerState.channelApiId,
            });
            setVideo(video);
          }
        }
      }
    };

    getVideo();
  }, [
    pluginsLoaded,
    plugin,
    playerState.apiId,
    playerState.isLive,
    playerState.channelApiId,
  ]);

  const onClose = () => {
    dispatch(closePlayer());
  };

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
              bottom: "64px",
              right: "16px",
              width: `${width}px`,
              height: `${height}px`,
              zIndex: 100,
              transition: "height 200ms ease-in-out, width 200ms ease-in-out",
            }
      }
    >
      {!useDefaultPlayer && (
        <IconButton
          aria-label="close"
          sx={{ position: "absolute", right: -10, top: -15, zIndex: 100 }}
          onClick={onClose}
        >
          <CancelIcon />
        </IconButton>
      )}
      {video && !usePlayer ? (
        <VideoPlayer
          video={video}
          isMiniPlayer={!useDefaultPlayer}
          timeInSeconds={timeInSeconds}
        />
      ) : null}
      {usePlayer && (
        <PluginPlayer
          apiId={playerState.apiId}
          channelApiId={playerState.channelApiId}
          plugin={plugin}
          isLive={playerState.isLive}
          isMiniPlayer={!useDefaultPlayer}
          timeInSeconds={timeInSeconds}
        />
      )}
      {!useDefaultPlayer && video && (
        <Card>
          <CardActionArea component={Link} to={url}>
            <CardContent>
              <Typography variant="body2">{video.title}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      )}
    </Box>
  );
};

export default MiniPlayer;
