import { ListItem, ListItemText, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { Video } from "../plugintypes";
import DOMPurify from "dompurify";

interface VideoSearchResultProps {
  video: Video;
}

const VideoSearchResult: React.FC<VideoSearchResultProps> = (props) => {
  const { video } = props;
  const sanitizer = DOMPurify.sanitize;

  return (
    <ListItem
      button={true}
      component={Link}
      to={`/plugins/${video.pluginId}/videos/${video.apiId}`}
    >
      <ListItemText
        primary={
          <Typography
            dangerouslySetInnerHTML={{ __html: sanitizer(video.title) }}
          />
        }
      />
    </ListItem>
  );
};

export default VideoSearchResult;
