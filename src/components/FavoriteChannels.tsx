import {
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import useItemMenu from "../hooks/useItemMenu";
import thumbnail from "../thumbnail.png";
import { db } from "../database";
import { useLiveQuery } from "dexie-react-hooks";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";
import { Link } from "react-router-dom";
import { MoreHoriz } from "@mui/icons-material";
import DOMPurify from "dompurify";

const FavoriteChannels: React.FC = () => {
  const channels = useLiveQuery(() => db.favoriteChannels.toArray());
  const sanitizer = DOMPurify.sanitize;
  const { openMenu } = useItemMenu();

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = thumbnail;
  };

  const channelCards = channels?.map((c) => {
    const openChannelMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (openMenu) {
        openMenu(event, { type: "channel", item: c });
      }
    };
    return (
      <Grid item xs={2} key={c.apiId}>
        <Card>
          <CardActionArea
            component={Link}
            to={`/plugins/${c.pluginId}/channels/${c.apiId}`}
          >
            <CardMedia
              component={"img"}
              image={getThumbnailImage(c.images, playlistThumbnailSize)}
              alt={c.name}
              onError={onImageError}
            />
          </CardActionArea>
          <CardActions>
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton size="small" onClick={openChannelMenu}>
                <MoreHoriz />
              </IconButton>
              <Typography
                title={c.name}
                gutterBottom
                variant="body2"
                component="span"
                width={230}
                noWrap
                dangerouslySetInnerHTML={{
                  __html: sanitizer(c.name),
                }}
              />
            </Stack>
          </CardActions>
        </Card>
      </Grid>
    );
  });
  return (
    <Grid container spacing={2}>
      {channelCards}
    </Grid>
  );
};

export default FavoriteChannels;