import {
  Avatar,
  Box,
  Checkbox,
  IconButton,
  Link,
  TableCell,
  Typography,
} from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import { formatSeconds } from "../utils";
import { MoreHoriz } from "@mui/icons-material";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import DOMPurify from "dompurify";
import { Link as RouterLink } from "react-router-dom";

interface PlaylistItemsProps {
  video: Video;
  showDuration: boolean;
  isSelected?: (id: string) => boolean;
  onSelectClick?: (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => void;
  openMenu?: (event: React.MouseEvent<HTMLButtonElement>, video: Video) => void;
  index?: number;
  playlistId?: string;
}

const PlaylistItem: React.FC<PlaylistItemsProps> = (props) => {
  const {
    video,
    showDuration,
    openMenu,
    onSelectClick,
    isSelected,
    index,
    playlistId,
  } = props;
  const sanitizer = DOMPurify.sanitize;

  let videoUrl = `/plugins/${video.pluginId}/videos/${video.apiId}`;
  videoUrl = playlistId
    ? `${videoUrl}?playlistId=${playlistId}&videoId=${video.id}`
    : videoUrl;

  const openVideoMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu) {
      openMenu(event, video);
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectClick) {
      onSelectClick(event, video.id || "");
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const image = getThumbnailImage(video.images, searchThumbnailSize);
  return (
    <>
      <TableCell padding="none">
        {isSelected && (
          <Checkbox
            color="primary"
            checked={isSelected(video.id || "")}
            onChange={onChange}
            onClick={stopPropagation}
            size="small"
            inputProps={
              {
                "data-index": index,
              } as any
            }
          />
        )}
      </TableCell>
      <TableCell>
        <Box
          sx={{
            display: "flex",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <Avatar alt={video.title} src={image} style={{ borderRadius: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Link
              component={RouterLink}
              to={videoUrl}
              onClick={stopPropagation}
            >
              <Typography
                noWrap={true}
                dangerouslySetInnerHTML={{ __html: sanitizer(video.title) }}
                title={video.title}
                sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
              />
            </Link>
            {video.channelApiId ? (
              <Link
                component={RouterLink}
                to={`/plugins/${video.pluginId}/channels/${video.channelApiId}`}
                onClick={stopPropagation}
              >
                {video.channelName}
              </Link>
            ) : (
              <Typography
                variant="body2"
                noWrap={true}
                dangerouslySetInnerHTML={{
                  __html: sanitizer(video.channelName || ""),
                }}
                sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
              />
            )}
          </Box>
        </Box>
      </TableCell>
      {showDuration && <TableCell>{formatSeconds(video.duration)}</TableCell>}
      <TableCell align="right" padding="checkbox">
        {openMenu && (
          <IconButton aria-label="options" size="small" onClick={openVideoMenu}>
            <MoreHoriz />
          </IconButton>
        )}
      </TableCell>
    </>
  );
};

export default React.memo(PlaylistItem);
