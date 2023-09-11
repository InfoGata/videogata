import React from "react";
import { VideoJsPlayerOptions } from "video.js";
import VideoJS from "../VideoJS";
import { Video } from "../plugintypes";

interface VideoPlayerProps {
  video: Video;
  isMiniPlayer?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { video, isMiniPlayer } = props;
  const options: VideoJsPlayerOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fill: true,
    controlBar: {
      pictureInPictureToggle: false,
    },
    sources: video.sources?.map((s) => ({
      src: s.source,
      type: s.type,
    })),
    playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  };

  return <VideoJS options={options} isMiniPlayer={isMiniPlayer} />;
};

export default VideoPlayer;
