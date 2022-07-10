import { Grid } from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
// import { VideoJsPlayerOptions } from "video.js";

interface VideoPlayerProps {
  video: Video;
}

const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { video } = props;
  // const options: VideoJsPlayerOptions = {
  //   autoplay: false,
  //   controls: true,
  //   sources: [
  //     {
  //       src: video.sources ? video.sources[0].source : "",
  //       type: video.sources ? video.sources[0].type : "",
  //     },
  //   ],
  // };
  const source = video.sources ? video.sources[0].source : "";

  return (
    <>
      <Grid sx={{ width: "640px", height: "480px" }}>
        <video width="640" height="480" controls src={source} />
      </Grid>
    </>
  );
};

export default VideoPlayer;
