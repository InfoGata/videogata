import { Visibility } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";
import { Link } from "react-router-dom";
import { Video } from "../plugintypes";
import {
  formatSeconds,
  getThumbnailImage,
  searchThumbnailSize,
} from "../utils";

interface RecommendedVideoProps {
  parentVideo: Video;
  video: Video;
}

const RecommendedVideo: React.FC<RecommendedVideoProps> = (props) => {
  const { parentVideo, video } = props;
  const sanitizer = DOMPurify.sanitize;
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });

  const image = getThumbnailImage(video.images, searchThumbnailSize);

  const url = `/plugins/${parentVideo.pluginId}/videos/${video.apiId}`;
  const channelUrl = `/plugins/${parentVideo.pluginId}/channels/${video.channelApiId}`;

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
              sx={{ position: "absolute", top: "150px", right: "10px" }}
            />
          ) : null}
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Grid container justifyContent="center" alignItems="center">
          {video.channelName ? (
            <Grid item xs={9}>
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
        </Grid>
      </CardActions>
    </Card>
  );
};

export default RecommendedVideo;
