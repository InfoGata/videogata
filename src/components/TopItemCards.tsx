import { MoreHoriz, PlaylistAdd } from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
  Fade,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import useVideoMenu from "../hooks/useVideoMenu";
import { usePlugins } from "../PluginsContext";
import { useAppSelector } from "../store/hooks";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import SelectPlugin from "./SelectPlugin";

const TopItemCards: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
  const { closeMenu, openMenu, anchorEl, menuVideo } = useVideoMenu();

  const getTopItems = async () => {
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin) {
      return await plugin.remote.onGetTopItems();
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
        key={v.apiId}
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
          <CardMedia component="img" src={image} sx={{ height: 200 }} />
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
            >
              {v.title}
            </Typography>
          </Stack>
        </CardActions>
      </Card>
    );
  });

  const openPlaylistDialog = () => setPlaylistDialogOpen(true);
  const addToNewPlaylist = () => {
    openPlaylistDialog();
    closeMenu();
  };

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
            Top Videos
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
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={addToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary="Add To New Playlist" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            videos={menuVideo ? [menuVideo] : []}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        videos={menuVideo ? [menuVideo] : []}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
      />
    </>
  );
};

export default TopItemCards;
