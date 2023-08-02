import { MoreHoriz } from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  CardActions,
  Fade,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import { Image } from "mui-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import usePlugins from "../hooks/usePlugins";
import useVideoMenu from "../hooks/useVideoMenu";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";
import SelectPlugin from "./SelectPlugin";

const TopItemCards: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();
  const { openMenu } = useVideoMenu();
  const { t } = useTranslation();
  const sanitizer = DOMPurify.sanitize;

  const getTopItems = async () => {
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin) {
      const results = await plugin.remote.onGetTopItems();
      return results;
    }
  };

  const query = useQuery(["topitems", pluginId], getTopItems, {
    // Keep query for 5 minutes
    staleTime: 1000 * 60 * 5,
  });

  const topVideoComponents = query.data?.videos?.items.map((v) => {
    const image = getThumbnailImage(v.images, playlistThumbnailSize);

    const openVideoMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      openMenu(event, v);
    };

    return (
      <Card
        key={v.id}
        sx={{
          width: 280,
          height: 250,
          display: "inline-block",
          margin: "10px",
          whiteSpace: "pre-wrap",
        }}
      >
        <CardActionArea
          component={Link}
          to={`/plugins/${pluginId}/videos/${v.apiId}`}
        >
          <Image src={image} height={200} />
        </CardActionArea>
        <CardActions>
          <Stack direction="row" alignItems="center" gap={1}>
            <IconButton size="small" onClick={openVideoMenu}>
              <MoreHoriz />
            </IconButton>
            <Typography
              title={v.title}
              gutterBottom
              variant="body2"
              component="span"
              width={230}
              noWrap
              dangerouslySetInnerHTML={{
                __html: sanitizer(v.title || ""),
              }}
            />
          </Stack>
        </CardActions>
      </Card>
    );
  });

  return (
    <>
      <Grid sx={{ display: pluginId ? "block" : "none" }}>
        <SelectPlugin
          pluginId={pluginId}
          setPluginId={setPluginId}
          methodName="onGetTopItems"
        />
      </Grid>
      <Fade in={!!topVideoComponents}>
        <Grid>
          <Typography variant="h5" style={{ marginLeft: "15px" }}>
            {t("topVideos")}
          </Typography>
          <Grid
            sx={{
              whiteSpace: "nowrap",
              overflowX: "scroll",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {topVideoComponents}
          </Grid>
        </Grid>
      </Fade>
    </>
  );
};

export default TopItemCards;
