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
  const playlists = useLiveQuery(() => db.favoritePlaylists.toArray());
  const { openMenu } = useItemMenu();
  const sanitizer = DOMPurify.sanitize;

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = thumbnail;
  };

  const playlistsCards = playlists?.map((p) => {
    const openChannelMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (openMenu) {
        openMenu(event, { type: "playlist", item: p });
      }
    };
    return (
      <Grid item xs={2} key={p.apiId}>
        <Card>
          <CardActionArea
            component={Link}
            to={`/plugins/${p.pluginId}/playlists/${p.apiId}`}
          >
            <CardMedia
              component={"img"}
              image={getThumbnailImage(p.images, playlistThumbnailSize)}
              alt={p.name}
              onError={onImageError}
            />
          </CardActionArea>
          <CardActions>
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton size="small" onClick={openChannelMenu}>
                <MoreHoriz />
              </IconButton>
              <Typography
                title={p.name}
                gutterBottom
                variant="body2"
                component="span"
                width={230}
                noWrap
                dangerouslySetInnerHTML={{
                  __html: sanitizer(p.name || ""),
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
      {playlistsCards}
    </Grid>
  );
};

export default FavoriteChannels;