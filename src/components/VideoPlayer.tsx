import { Grid } from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";

interface VideoPlayerProps {
  video: Video;
}

const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { video } = props;
  const videoRef = React.useRef<HTMLVideoElement>(null);

  return (
    <>
      <Grid sx={{ width: "640px", height: "480px" }}>
        {video.source && (
          <video
            ref={videoRef}
            width="640"
            height="480"
            controls
            src={video.source}
          />
        )}
      </Grid>
    </>
  );
};

export default VideoPlayer;
