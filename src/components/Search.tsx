import {
  AppBar,
  Backdrop,
  Box,
  CircularProgress,
  List,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { Channel, PlaylistInfo, Video } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import { SearchResultType } from "../types";
import ChannelSearchResult from "./ChannelSearchResult";
import PlaylistMenuItem from "./PlaylistMenuItem";
import PlaylistSearchResult from "./PlaylistSearchResult";
import SelectPlugin from "./SelectPlugin";
import useVideoMenu from "../hooks/useVideoMenu";
import VideoList from "./VideoList";
import { PlaylistAdd } from "@mui/icons-material";
import AddPlaylistDialog from "./AddPlaylistDialog";

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
};

const Search: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const [tabValue, setTabValue] = React.useState<string | boolean>(false);
  const { plugins } = usePlugins();
  const location = useLocation();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";
  const { closeMenu, openMenu, anchorEl, menuVideo } = useVideoMenu();
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);

  const onSearch = async () => {
    let videos: Video[] | undefined = [];
    let playlists: PlaylistInfo[] | undefined = [];
    let channels: Channel[] | undefined = [];

    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin && (await plugin.hasDefined.onSearchAll())) {
      const searchAll = await plugin.remote.onSearchAll({ query: searchQuery });
      videos = searchAll.videos?.items || [];
      playlists = searchAll.playlists?.items || [];
      channels = searchAll.channels?.items || [];
    }

    if (videos) {
      setTabValue(SearchResultType.Videos);
    } else if (playlists) {
      setTabValue(SearchResultType.Playlists);
    } else if (channels) {
      setTabValue(SearchResultType.Channels);
    }

    return {
      videos,
      playlists,
      channels,
    };
  };

  const query = useQuery(["search", pluginId, searchQuery], onSearch);

  const playlistList = query.data?.playlists.map((p) => (
    <PlaylistSearchResult key={p.apiId} playlist={p} pluginId={pluginId} />
  ));

  const channelList = query.data?.channels.map((c) => (
    <ChannelSearchResult key={c.apiId} channel={c} pluginId={pluginId} />
  ));

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue);
  };

  const addMenuVideoToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
  };

  return (
    <>
      <SelectPlugin
        pluginId={pluginId}
        setPluginId={setPluginId}
        methodName="onSearchAll"
      />
      <AppBar position="static">
        <Backdrop open={query.isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Tabs
          value={tabValue}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {query.data?.videos && query.data.videos.length > 0 ? (
            <Tab label="Videos" value={SearchResultType.Videos} />
          ) : null}
          {channelList && channelList.length > 0 ? (
            <Tab label="Channels" value={SearchResultType.Channels} />
          ) : null}
          {playlistList && playlistList.length > 0 ? (
            <Tab label="Playlists" value={SearchResultType.Playlists} />
          ) : null}
        </Tabs>
      </AppBar>
      <TabPanel value={tabValue} index={SearchResultType.Videos}>
        <VideoList
          videos={query.data?.videos || []}
          openMenu={openMenu}
          dragDisabled={true}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Channels}>
        <List dense={true}>{channelList}</List>
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Playlists}>
        <List dense={true}>{playlistList}</List>
      </TabPanel>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={addMenuVideoToNewPlaylist}>
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

export default Search;
