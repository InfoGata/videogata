import { MoreHoriz } from "@mui/icons-material";
import {
  Button,
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
import { db } from "../database";
import useItemMenu from "../hooks/useItemMenu";
import PlaylistImage from "./PlaylistImage";
import Spinner from "./Spinner";
import usePlugins from "../hooks/usePlugins";
import { filterAsync } from "../utils";
import { PluginFrameContainer } from "../PluginsContext";

const FavoriteChannels: React.FC = () => {
  const channels = useLiveQuery(() => db.favoriteChannels.toArray());
  const sanitizer = DOMPurify.sanitize;
  const { openMenu } = useItemMenu();
  const { t } = useTranslation();
  const { plugins } = usePlugins();
  const [channelPlugins, setChannelPlugins] = React.useState<
    PluginFrameContainer[]
  >([]);
  React.useEffect(() => {
    const setPlugins = async () => {
      const filteredPlugins = await filterAsync(
        plugins,
        async (p) => await p.hasDefined.onGetUserChannels()
      );
      setChannelPlugins(filteredPlugins);
    };
    setPlugins();
  }, [plugins]);

  if (!channels) {
    return <Spinner />;
  }

  const channelCards = channels?.map((c) => {
    const openChannelMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (openMenu) {
        openMenu(event, { type: "channel", item: c });
      }
    };
    return (
      <>
        <Grid>
          {channelPlugins.map((p) => (
            <Button
              component={Link}
              to={`/plugins/${p.id}/channels`}
              key={p.id}
            >
              {p.name}
            </Button>
          ))}
        </Grid>
        <Grid item xs={2} key={c.apiId}>
          <Card>
            <CardActionArea
              component={Link}
              to={`/plugins/${c.pluginId}/channels/${c.apiId}`}
            >
              <PlaylistImage images={c.images} />
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
      </>
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
