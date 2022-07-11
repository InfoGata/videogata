import { Grid } from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import { VideoJsPlayerOptions } from "video.js";
import VideoJS from "../VideoJS";

interface VideoPlayerProps {
  video: Video;
}

const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { video } = props;
  const options: VideoJsPlayerOptions = {
    autoplay: false,
    controls: true,
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
