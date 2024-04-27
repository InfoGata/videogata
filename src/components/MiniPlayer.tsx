import { cn } from "@/lib/utils";
import { XCircleIcon } from "lucide-react";
import React from "react";
import usePlugins from "../hooks/usePlugins";
import { Video } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { closePlayer } from "../store/reducers/playerReducer";
import PluginPlayer from "./PluginPlayer";
import VideoPlayer from "./VideoPlayer";
import { Button } from "./ui/button";
import { Link, useRouterState, useSearch } from "@tanstack/react-router";

const MiniPlayer: React.FC = () => {
  const playerState = useAppSelector((state) => state.player);
  const [usePlayer, setUsePlayer] = React.useState(false);
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === playerState.pluginId);
  const [video, setVideo] = React.useState<Video>();
  const dispatch = useAppDispatch();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const useDefaultPlayer =
    pathname.endsWith("/live") ||
    pathname.endsWith(`/videos/${playerState.apiId}`);
  const useMiniPlayer = useAppSelector((state) => state.settings.useMiniPlayer);
  const { time } = useSearch({ strict: false });

  React.useEffect(() => {
    if (time) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [time]);

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
          timeInSeconds={time}
        />
      ) : null}
      {usePlayer && (
        <PluginPlayer
          apiId={playerState.apiId}
          channelApiId={playerState.channelApiId}
          plugin={plugin}
          isLive={playerState.isLive}
          isMiniPlayer={!useDefaultPlayer}
          timeInSeconds={time}
        />
      )}
      {!useDefaultPlayer && video && (
        <Link
          to="/plugins/$pluginId/videos/$apiId"
          params={{ pluginId: video.pluginId || "", apiId: video.apiId || "" }}
        >
          <p className="text-sm">{video.title}</p>
        </Link>
      )}
    </div>
  );
};

export default MiniPlayer;
