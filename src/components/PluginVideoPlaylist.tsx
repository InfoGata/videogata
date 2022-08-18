import {
  List,
  Box,
  ListItem,
  Avatar,
  ListItemAvatar,
  ListItemText,
  Typography,
  IconButton,
} from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { SkipNext, SkipPrevious } from "@mui/icons-material";

interface PluginVideoPlaylistProps {
  videos: Video[];
  videoId?: string;
  playlistId: string;
}

const getVideoUrl = (video?: Video, playlistId?: string) => {
  return `/plugins/${video?.pluginId}/videos/${video?.apiId}?playlistId=${playlistId}&videoId=${video?.id}`;
};

const PluginVideoPlaylist: React.FC<PluginVideoPlaylistProps> = (props) => {
  const { videos, playlistId, videoId } = props;
  const sanitizer = DOMPurify.sanitize;
  const videoIndex = videos.findIndex((v) => v.id === videoId);
  const prevDisabled = videoIndex <= 0;
  const nextDisabled = videoIndex >= videos.length - 1;
  const prevVideo = prevDisabled ? undefined : videos[videoIndex - 1];
  const nextVideo = nextDisabled ? undefined : videos[videoIndex + 1];
  const prevVideoUrl = prevDisabled ? "" : getVideoUrl(prevVideo, playlistId);
  const nextVideoUrl = nextDisabled ? "" : getVideoUrl(nextVideo, playlistId);

  const videoList = videos.map((v) => {
    const image = getThumbnailImage(v.images, searchThumbnailSize);
    const videoUrl = getVideoUrl(v, playlistId);
    return (
      <ListItem
        button={true}
        component={Link}
        to={videoUrl}
        selected={videoId === v.id}
        key={v.id}
      >
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
      <IconButton
        aria-label="previous"
        disabled={prevDisabled}
        component={Link}
        to={prevVideoUrl}
      >
        <SkipPrevious />
      </IconButton>
      <IconButton
        aria-label="next"
        disabled={nextDisabled}
        component={Link}
        to={nextVideoUrl}
      >
        <SkipNext />
      </IconButton>
      <List>{videoList}</List>
    </Box>
  );
};

export default PluginVideoPlaylist;
