import { MoreVert, Visibility } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";
import { Link } from "react-router-dom";
import { Video } from "../plugintypes";
import {
  formatSeconds,
  getThumbnailImage,
  playlistThumbnailSize,
} from "../utils";

interface VideoCardProps {
  pluginId: string;
  video: Video;
  openMenu?: (event: React.MouseEvent<HTMLButtonElement>, video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = (props) => {
  const { pluginId, video, openMenu } = props;
  const sanitizer = DOMPurify.sanitize;
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });

  const image = getThumbnailImage(video.images, playlistThumbnailSize);

  const url = `/plugins/${pluginId}/videos/${video.apiId}`;
  const channelUrl = `/plugins/${pluginId}/channels/${video.channelApiId}`;

  const openVideoMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu) {
      openMenu(event, video);
    }
  };

  return (
    <Card sx={{ maxWidth: "250px" }}>
      <CardActionArea component={Link} to={url}>
        <CardMedia component="img" alt={video.title} image={image} />
        <CardContent>
          <Typography
            variant="body2"
            dangerouslySetInnerHTML={{
              __html: sanitizer(video.title),
            }}
          />
          {video.duration ? (
            <Chip
              label={formatSeconds(video.duration)}
              color="primary"
              sx={{ position: "absolute", top: "10px", right: "10px" }}
            />
          ) : null}
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Grid container justifyContent="center" alignItems="center">
          {video.channelName ? (
            <Grid item xs={8}>
              <Button
                size="small"
                component={Link}
                to={channelUrl}
                disabled={!video.channelApiId}
              >
                {video.channelName}
              </Button>
            </Grid>
          ) : null}
          {video.views ? (
            <Grid container item xs={3}>
              <Typography variant="body2">
                {numberFormatter.format(video.views)}
              </Typography>
              <Visibility fontSize="small" />
            </Grid>
          ) : null}
          <Grid item xs={1}>
            {openMenu && (
              <IconButton onClick={openVideoMenu} size="small">
                <MoreVert fontSize="inherit" />
              </IconButton>
            )}
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default VideoCard;
