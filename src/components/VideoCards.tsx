import { Grid } from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import VideoCard from "./VideoCard";

interface VideoCardsProps {
  videos: Video[];
  openMenu?: (event: React.MouseEvent<HTMLButtonElement>, video: Video) => void;
}

const VideoCards: React.FC<VideoCardsProps> = (props) => {
  const { videos, openMenu } = props;
  const cards = videos.map((v) => (
    <Grid key={v.id} item lg={2}>
      <VideoCard pluginId={v.pluginId || ""} video={v} openMenu={openMenu} />
    </Grid>
  ));
  return (
    <Grid container spacing={2}>
      {cards}
    </Grid>
  );
};

export default VideoCards;
