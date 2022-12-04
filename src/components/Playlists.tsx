import {
  Button,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React from "react";
import { PluginFrameContainer, usePlugins } from "../PluginsContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { filterAsync } from "../utils";
import { Link } from "react-router-dom";
import { PlaylistInfo } from "../plugintypes";
import { Delete, MoreHoriz } from "@mui/icons-material";
import { deletePlaylist } from "../store/reducers/playlistReducer";
import { useTranslation } from "react-i18next";
import ImportPlaylistUrlDialog from "./ImportPlaylistUrlDialog";

interface PlaylistsItemProps {
  playlist: PlaylistInfo;
  openMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    playlist: PlaylistInfo
  ) => void;
}

const PlaylistsItem: React.FC<PlaylistsItemProps> = (props) => {
  const { playlist, openMenu } = props;
  const playlistPath = `/playlists/${props.playlist.id}`;
  const openPlaylistMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, playlist);
  };

  return (
    <ListItem button={true} component={Link} to={playlistPath}>
      <ListItemText>{playlist.name}</ListItemText>
      <ListItemSecondaryAction>
        <IconButton onClick={openPlaylistMenu} size="large">
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const Playlists: React.FC = () => {
  const { plugins } = usePlugins();
  const dispatch = useAppDispatch();
  const [playlistPlugins, setPlaylistPlugins] = React.useState<
    PluginFrameContainer[]
  >([]);
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const [menuPlaylist, setMenuPlaylist] = React.useState<
    PlaylistInfo | undefined
  >();
  const closeMenu = () => setAnchorEl(null);
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openImportDialog, setOpenImportDialog] = React.useState(false);
  const onOpenImportDialog = () => setOpenImportDialog(true);
  const onCloseImportDialog = () => setOpenImportDialog(false);

  const pluginPlaylists = playlistPlugins.map((p) => (
    <Button
      component={Link}
      to={`/plugins/${p.id}/playlists?isuserplaylist`}
      key={p.id}
    >
      {p.name}
    </Button>
  ));

  React.useEffect(() => {
    const setPlugins = async () => {
      const filteredPlugins = await filterAsync(
        plugins,
        async (p) =>
          (await p.hasDefined.onGetUserPlaylists()) &&
          (await p.hasDefined.onGetPlaylistVideos())
      );
      setPlaylistPlugins(filteredPlugins);
    };
    setPlugins();
  }, [plugins]);

  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    playlist: PlaylistInfo
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuPlaylist(playlist);
  };

  const deleteClick = () => {
    if (menuPlaylist) {
      dispatch(deletePlaylist(menuPlaylist));
    }
    closeMenu();
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t("playlists")}
      </Typography>
      <Button variant="contained" onClick={onOpenImportDialog}>
        {t("importPlaylistByUrl")}
      </Button>
      <Grid>{pluginPlaylists}</Grid>
      <List>
        {playlists.map((p) => (
          <PlaylistsItem key={p.id} playlist={p} openMenu={openMenu} />
        ))}
      </List>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={deleteClick}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText primary={t("delete")} />
        </MenuItem>
      </Menu>
      <ImportPlaylistUrlDialog
        open={openImportDialog}
        handleClose={onCloseImportDialog}
      />
    </>
  );
};

export default Playlists;
