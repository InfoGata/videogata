import { Button, Grid, Typography } from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { ThumbDown, ThumbUp, Visibility } from "@mui/icons-material";

interface PluginVideoInfoProps {
  video: Video;
}

const PluginVideoInfo: React.FC<PluginVideoInfoProps> = (props) => {
  const { video } = props;
  const channelUrl = `/plugins/${video.pluginId}/channels/${video.channelApiId}`;
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });
  const uploadDate =
    video.uploadDate &&
    new Date(video.uploadDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const sanitizer = DOMPurify.sanitize;

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
        <Button component={Link} to={channelUrl} disabled={!video.channelApiId}>
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
      {uploadDate ? (
        <Grid container>
          <Typography variant="body1">{uploadDate}</Typography>
        </Grid>
      ) : null}
    </Grid>
  );
};

export default PluginVideoInfo;
