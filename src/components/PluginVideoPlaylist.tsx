import { cn } from "@/lib/utils";
import { SkipBackIcon, SkipForwardIcon } from "lucide-react";
import React from "react";
import { Video } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { setCurrentVideo } from "../store/reducers/queueReducer";
import VideoList from "./VideoList";
import { buttonVariants } from "./ui/button";
import { Link, useNavigate } from "@tanstack/react-router";

interface PluginVideoPlaylistProps {
  videos: Video[];
  videoId?: string;
  playlistId: string;
}

// Params rather than a built path: the route renders `pluginId` as the plugin's
// url alias.
const videoLinkProps = (video: Video, playlistId: string) =>
  ({
    to: "/s/$pluginId/videos/$apiId",
    params: { pluginId: video.pluginId || "", apiId: video.apiId || "" },
    search: { playlistId, videoId: video.id },
  }) as const;

const PluginVideoPlaylist: React.FC<PluginVideoPlaylistProps> = (props) => {
  const { videos, playlistId, videoId } = props;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const videoIndex = videos.findIndex((v) => v.id === videoId);
  const currentVideo = videos[videoIndex];
  const prevDisabled = videoIndex <= 0;
  const nextDisabled = videoIndex >= videos.length - 1;
  const prevVideo = prevDisabled ? undefined : videos[videoIndex - 1];
  const nextVideo = nextDisabled ? undefined : videos[videoIndex + 1];

  React.useEffect(() => {
    dispatch(setCurrentVideo(currentVideo));
  }, [currentVideo, dispatch]);

  React.useEffect(() => {
    const onNextVideo = () => {
      if (nextVideo) {
        navigate(videoLinkProps(nextVideo, playlistId));
      }
    };

    document.addEventListener("nextVideo", onNextVideo);
    return () => document.removeEventListener("nextVideo", onNextVideo);
  }, [navigate, nextVideo, playlistId]);

  const skipClassName = cn(
    buttonVariants({ variant: "ghost", size: "icon" }),
    "pointer-events-none opacity-50"
  );

  return (
    <div>
      {prevVideo ? (
        <Link
          {...videoLinkProps(prevVideo, playlistId)}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <SkipBackIcon />
        </Link>
      ) : (
        <span className={skipClassName}>
          <SkipBackIcon />
        </span>
      )}
      {nextVideo ? (
        <Link
          {...videoLinkProps(nextVideo, playlistId)}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <SkipForwardIcon />
        </Link>
      ) : (
        <span className={skipClassName}>
          <SkipForwardIcon />
        </span>
      )}
      <div>
        <VideoList
          videos={videos}
          playlistId={playlistId}
          currentVideoId={videoId}
        />
      </div>
    </div>
  );
};

export default PluginVideoPlaylist;
