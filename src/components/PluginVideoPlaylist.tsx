import { cn } from "@/lib/utils";
import { SkipBackIcon, SkipForwardIcon } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Video } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { setCurrentVideo } from "../store/reducers/queueReducer";
import VideoList from "./VideoList";
import { buttonVariants } from "./ui/button";

interface PluginVideoPlaylistProps {
  videos: Video[];
  videoId?: string;
  playlistId: string;
}

const getVideoUrl = (video?: Video, playlistId?: string) => {
  return `/plugins/${video?.pluginId}/videos/${video?.apiId}?playlistId=${playlistId}&videoId=${video?.id}`;
};

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
  const prevVideoUrl = prevDisabled ? "" : getVideoUrl(prevVideo, playlistId);
  const nextVideoUrl = nextDisabled ? "" : getVideoUrl(nextVideo, playlistId);

  React.useEffect(() => {
    dispatch(setCurrentVideo(currentVideo));
  }, [currentVideo, dispatch]);

  React.useEffect(() => {
    const onNextVideo = () => {
      if (nextVideoUrl) {
        navigate(nextVideoUrl);
      }
    };

    document.addEventListener("nextVideo", onNextVideo);
    return () => document.removeEventListener("nextVideo", onNextVideo);
  }, [navigate, nextVideoUrl]);

  return (
    <div>
      <Link
        to={prevVideoUrl}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          prevDisabled && "pointer-events-none opacity-50"
        )}
      >
        <SkipBackIcon />
      </Link>
      <Link
        to={nextVideoUrl}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          nextDisabled && "pointer-events-none opacity-50"
        )}
      >
        <SkipForwardIcon />
      </Link>
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
