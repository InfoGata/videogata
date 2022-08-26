import { Button, Grid, Typography } from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import RecommendedVideo from "./RecommendedVideo";
import { ThumbDown, ThumbUp, Visibility } from "@mui/icons-material";

interface PluginVideoInfoProps {
  video: Video;
}

const PluginVideoInfo: React.FC<PluginVideoInfoProps> = (props) => {
  const { video } = props;
  const channelUrl = `/plugins/${video.pluginId}/channels/${video.channelApiId}`;
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });

  const sanitizer = DOMPurify.sanitize;

  const recommendations = video.recommendedVideos?.map((v) => (
    <RecommendedVideo parentVideo={video} video={v} />
  ));
  return (
    <Grid>
      <Typography
        component="div"
        variant="h5"
        dangerouslySetInnerHTML={{
          __html: sanitizer(video.title),
        }}
      />
      {video.channelName ? (
        <Button component={Link} to={channelUrl}>
          {video.channelName}
        </Button>
      ) : null}
      {video.views && (
        <Grid container>
          <Visibility />
          <Typography variant="body1">
            {numberFormatter.format(video.views)}
          </Typography>
        </Grid>
      )}
      {video.likes ? (
        <Grid container>
          <ThumbUp />
          <Typography variant="body1">
            {numberFormatter.format(video.likes)}
          </Typography>
        </Grid>
      ) : null}
      {video.dislikes ? (
        <Grid container>
          <ThumbDown />
          <Typography variant="body1">
            {numberFormatter.format(video.dislikes)}
          </Typography>
        </Grid>
      ) : null}
      {recommendations}
    </Grid>
  );
};

export default PluginVideoInfo;
