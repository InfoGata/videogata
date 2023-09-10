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
  const channels = useLiveQuery(() => db.favoriteChannels.toArray());
  const sanitizer = DOMPurify.sanitize;
  const { openMenu } = useItemMenu();
  const { t } = useTranslation();

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
      {channels && channels.length > 0 ? (
        channelCards
      ) : (
        <Grid item>
          <Typography>{t("noFavoriteChannels")}</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default FavoriteChannels;
