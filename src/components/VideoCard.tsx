import { MoreVert, Visibility } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";
import { Link } from "react-router-dom";
import { Video } from "../plugintypes";
import { formatSeconds } from "../utils";
import PlaylistImage from "./PlaylistImage";
import TimeAgo from "timeago-react";

interface VideoCardProps {
  pluginId: string;
  video: Video;
  openMenu?: (event: React.MouseEvent<HTMLButtonElement>, video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = (props) => {
  const { pluginId, video, openMenu } = props;
  const sanitizer = DOMPurify.sanitize;
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });

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
        <PlaylistImage images={video.images} />
        <CardContent sx={{ padding: "4px" }}>
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
              clickable
            />
          ) : null}
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ padding: 0 }}>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={10}>
            {video.channelName ? (
              <Button
                size="small"
                component={Link}
                to={channelUrl}
                disabled={!video.channelApiId}
              >
                {video.channelName}
              </Button>
            ) : null}
          </Grid>
          <Grid item xs={2}>
            {openMenu && (
              <IconButton onClick={openVideoMenu} size="small">
                <MoreVert fontSize="inherit" />
              </IconButton>
            )}
          </Grid>
          <Grid container item xs={12}>
            {video.views ? (
              <>
                <Visibility fontSize="small" />
                <Typography variant="body2">
                  {numberFormatter.format(video.views)}•
                </Typography>
              </>
            ) : null}
            {video.uploadDate && (
              <Typography variant="body2">
                <TimeAgo datetime={video.uploadDate} />
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default VideoCard;
