import React from "react";
import { usePlugins } from "../PluginsContext";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import thumbnail from "../thumbnail.png";
import {
  Backdrop,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";

const PluginPlaylists: React.FC = () => {
  const { plugins } = usePlugins();
  const { pluginId } = useParams<"pluginId">();
  const { t } = useTranslation();
  const plugin = plugins.find((p) => p.id === pluginId);

  const getPlaylists = async () => {
    if (plugin && (await plugin.hasDefined.onGetUserPlaylists())) {
      const request = {};
      const p = await plugin.remote.onGetUserPlaylists(request);
      return p.items;
    }
    return [];
  };

  const query = useQuery(["pluginplaylists", pluginId], getPlaylists);
  const playlists = query.data || [];

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = thumbnail;
  };

  const playlistLinks = playlists.map((p, i) => (
    <Grid item xs={2} key={i}>
      <Card>
        <CardActionArea
          component={Link}
          to={`/plugins/${pluginId}/playlists/${p.apiId}?isuserplaylist`}
        >
          <CardMedia
            component={"img"}
            image={getThumbnailImage(p.images, playlistThumbnailSize)}
            alt={p.name}
            onError={onImageError}
          />
          <CardContent>
            <Typography gutterBottom variant="h6" component="div">
              {p.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  ));
  return plugin ? (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container spacing={2}>
        {playlistLinks}
      </Grid>
    </>
  ) : (
    <>{t("notFound")}</>
  );
};

export default PluginPlaylists;
