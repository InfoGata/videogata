import { MoreHoriz } from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  CardActions,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import DOMPurify from "dompurify";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import PlaylistImage from "../components/PlaylistImage";
import { db } from "../database";
import useItemMenu from "../hooks/useItemMenu";

const FavoriteChannels: React.FC = () => {
  const playlists = useLiveQuery(() => db.favoritePlaylists.toArray());
  const { openMenu } = useItemMenu();
  const sanitizer = DOMPurify.sanitize;
  const { t } = useTranslation();

  if (!playlists) {
    return null;
  }

  if (playlists.length === 0) {
    return <h3>{t("noFavoritePlaylists")}</h3>;
  }

  const playlistsCards = playlists.map((p) => {
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
            <PlaylistImage images={p.images} />
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
