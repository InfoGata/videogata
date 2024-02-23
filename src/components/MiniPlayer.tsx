import { cn } from "@/lib/utils";
import { XCircleIcon } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import usePlugins from "../hooks/usePlugins";
import { Video } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { closePlayer } from "../store/reducers/playerReducer";
import PluginPlayer from "./PluginPlayer";
import VideoPlayer from "./VideoPlayer";
import { Button } from "./ui/button";

const MiniPlayer: React.FC = () => {
  const playerState = useAppSelector((state) => state.player);
  const [usePlayer, setUsePlayer] = React.useState(false);
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === playerState.pluginId);
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
    <div
      className={cn(
        !useDefaultPlayer &&
          "fixed right-4 bottom-16 w-64 h-40 z-50 transition duraion-200 ease-in-out"
      )}
    >
      {!useDefaultPlayer && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute -right-3 -top-4 z-50"
        >
          <XCircleIcon />
        </Button>
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
        <Link to={url}>
          <p className="text-sm">{video.title}</p>
        </Link>
      )}
    </div>
  );
};

export default MiniPlayer;
