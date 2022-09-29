import { Grid } from "@mui/material";
import React from "react";
import useVideoMenu from "../hooks/useVideoMenu";
import { Video } from "../plugintypes";
import VideoCard from "./VideoCard";

interface RecommendedVideosProps {
  videos: Video[];
  pluginId: string;
}

const RecommendedVideos: React.FC<RecommendedVideosProps> = (props) => {
  const { videos, pluginId } = props;
  const { openMenu } = useVideoMenu();

  const recommendations = videos.map((v) => (
    <VideoCard
      key={v.apiId}
      pluginId={pluginId}
      video={v}
      openMenu={openMenu}
    />
  ));

  return (
    <Grid item xs={3}>
      {recommendations}
    </Grid>
  );
};

export default RecommendedVideos;
