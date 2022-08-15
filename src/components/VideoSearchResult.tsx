import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { Video } from "../plugintypes";
import DOMPurify from "dompurify";
import { MoreHoriz } from "@mui/icons-material";

interface VideoSearchResultProps {
  video: Video;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, video: Video) => void;
}

const VideoSearchResult: React.FC<VideoSearchResultProps> = (props) => {
  const { video, openMenu } = props;
  const sanitizer = DOMPurify.sanitize;

  const openVideoMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, video);
  };

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
      <ListItemSecondaryAction>
        <IconButton onClick={openVideoMenu} size="large">
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default VideoSearchResult;
