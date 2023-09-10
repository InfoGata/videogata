import { MoreHoriz } from "@mui/icons-material";
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
import { useLiveQuery } from "dexie-react-hooks";
import DOMPurify from "dompurify";
import React from "react";
import { Link } from "react-router-dom";
import { db } from "../database";
import useItemMenu from "../hooks/useItemMenu";
import thumbnail from "../thumbnail.png";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";
import { useTranslation } from "react-i18next";

const FavoriteChannels: React.FC = () => {
  const playlists = useLiveQuery(() => db.favoritePlaylists.toArray());
  const { openMenu } = useItemMenu();
  const sanitizer = DOMPurify.sanitize;
  const { t } = useTranslation();

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
      {playlists && playlists.length > 0 ? (
        playlistsCards
      ) : (
        <Grid item>
          <Typography>{t("noFavoritePlaylists")}</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default FavoriteChannels;
