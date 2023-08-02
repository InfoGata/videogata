import { Grid } from "@mui/material";
import React from "react";
import { VideoJsPlayerOptions } from "video.js";
import VideoJS from "../VideoJS";
import { Video } from "../plugintypes";

interface VideoPlayerProps {
  video: Video;
}

const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { video } = props;
  const options: VideoJsPlayerOptions = {
    autoplay: true,
    controls: true,
    playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  };

  return (
    <>
      <Grid>
        <VideoJS options={options} videoSources={video.sources ?? []} />
      </Grid>
    </>
  );
};

export default VideoPlayer;
