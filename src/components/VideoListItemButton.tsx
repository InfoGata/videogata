import {
  Avatar,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { Video } from "../plugintypes";
import DOMPurify from "dompurify";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface VideoListItemButtonProps {
  video: Video;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, video: Video) => void;
  playlistId?: string;
}

const VideoListItemButton: React.FC<VideoListItemButtonProps> = (props) => {
  const { video, playlistId } = props;
  const sanitizer = DOMPurify.sanitize;

  let videoUrl = `/plugins/${video.pluginId}/videos/${video.apiId}`;
  videoUrl = playlistId
    ? `${videoUrl}?playlistId=${playlistId}&videoId=${video.id}`
    : videoUrl;

  const image = getThumbnailImage(video.images, searchThumbnailSize);
  return (
    <ListItemButton component={Link} to={videoUrl}>
      <ListItemAvatar>
        <Avatar alt={video.title} src={image} style={{ borderRadius: 0 }} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            dangerouslySetInnerHTML={{ __html: sanitizer(video.title) }}
          />
        }
      />
    </ListItemButton>
  );
};

export default VideoListItemButton;
