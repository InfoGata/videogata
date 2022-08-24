import { Grid, Typography } from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";

interface PluginVideoInfoProps {
  video: Video;
}

const PluginVideoInfo: React.FC<PluginVideoInfoProps> = (props) => {
  const { video } = props;
  const channelUrl = `/plugins/${video.pluginId}/channels/${video.channelApiId}`;

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
        <Typography
          component={video.channelApiId ? Link : "div"}
          variant="subtitle1"
          to={video.channelApiId && channelUrl}
          dangerouslySetInnerHTML={{
            __html: sanitizer(video.channelName),
          }}
        />
      ) : null}
      {video.views && (
        <Typography component="div" variant="body1">
          {video.views.toLocaleString()} Views
        </Typography>
      )}
      {video.likes ? (
        <Typography component="div" variant="body1">
          {video.likes.toLocaleString()} likes
        </Typography>
      ) : null}
      {video.dislikes ? (
        <Typography component="div" variant="body1">
          {video.dislikes.toLocaleString()} dislikes
        </Typography>
      ) : null}
    </Grid>
  );
};

export default PluginVideoInfo;
