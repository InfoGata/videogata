import {
  List,
  Box,
  ListItem,
  Avatar,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";

interface PluginVideoPlaylistProps {
  videos: Video[];
  playlistId: string;
}

const PluginVideoPlaylist: React.FC<PluginVideoPlaylistProps> = (props) => {
  const { videos, playlistId } = props;
  const sanitizer = DOMPurify.sanitize;

  const videoList = videos.map((v) => {
    const image = getThumbnailImage(v.images, searchThumbnailSize);
    const videoUrl = `/plugins/${v.pluginId}/videos/${v.apiId}?playlistId=${playlistId}`;
    return (
      <ListItem button={true} component={Link} to={videoUrl}>
        <ListItemAvatar>
          <Avatar alt={v.title} src={image} style={{ borderRadius: 0 }} />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography
              dangerouslySetInnerHTML={{ __html: sanitizer(v.title) }}
            />
          }
        />
      </ListItem>
    );
  });

  return (
    <Box>
      <List>{videoList}</List>
    </Box>
  );
};

export default PluginVideoPlaylist;
