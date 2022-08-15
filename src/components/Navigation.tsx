import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { Extension, Home, Menu, PlaylistAdd } from "@mui/icons-material";
import NavigationPlaylistItem from "./NavigationPlaylistItem";
import { useAppSelector } from "../store/hooks";
import AddPlaylistDialog from "./AddPlaylistDialog";

const Navigation: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const navbarOpen = useAppSelector((state) => state.ui.navbarOpen);

  const openDialog = () => {
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
  };

  const playlistItems = playlists.map((p) => (
    <NavigationPlaylistItem playlist={p} key={p.id} />
  ));

  return (
    <List>
      <ListItem button={true} component={Link} to="/" key="Home">
        <ListItemIcon>
          <Tooltip title="Home" placement="right">
            <Home />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>Home</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/plugins" key="Plugins">
        <ListItemIcon>
          <Tooltip title="Plugins" placement="right">
            <Extension />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>Plugins</ListItemText>
      </ListItem>
      <ListItem button={true} key="AddPlaylist" onClick={openDialog}>
        <ListItemIcon>
          <Tooltip title="Add Playlist" placement="right">
            <PlaylistAdd />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>Add Playlist</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/playlists" key="Playlists">
        <ListItemIcon>
          <Tooltip title="Playlists" placement="right">
            <Menu />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>Playlists</ListItemText>
      </ListItem>
      {navbarOpen ? playlistItems : null}
      <AddPlaylistDialog handleClose={closeDialog} open={dialogOpen} />
    </List>
  );
};

export default React.memo(Navigation);
