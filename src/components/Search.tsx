import {
  AppBar,
  Backdrop,
  Box,
  CircularProgress,
  List,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { PlaylistInfo, Video } from "../plugintypes";
import { SearchResultType } from "../types";
import PlaylistSearchResult from "./PlaylistSearchResult";
import SelectPlugin from "./SelectPlugin";
import VideoSearchResult from "./VideoSearchResult";

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
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";

  const onSearch = async () => {
    let videos: Video[] | undefined = [];
    let playlists: PlaylistInfo[] | undefined = [];

    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin && (await plugin.hasDefined.onSearchAll())) {
      const searchAll = await plugin.remote.onSearchAll({ query: searchQuery });
      videos = searchAll.videos?.items || [];
      playlists = searchAll.playlists?.items || [];
    }

    if (videos) {
      setTabValue(SearchResultType.Videos);
    } else if (playlists) {
      setTabValue(SearchResultType.Playlists);
    }

    return {
      videos,
      playlists,
    };
  };

  const query = useQuery(["search", pluginId, searchQuery], onSearch);

  const videoList = query.data?.videos.map((v) => (
    <VideoSearchResult key={v.apiId} video={v} />
  ));

  const playlistList = query.data?.playlists.map((p) => (
    <PlaylistSearchResult key={p.apiId} playlist={p} pluginId={pluginId} />
  ));

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue);
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
          {videoList && videoList.length > 0 ? (
            <Tab label="Tracks" value={SearchResultType.Videos} />
          ) : null}
          {playlistList && playlistList.length > 0 ? (
            <Tab label="Playlists" value={SearchResultType.Playlists} />
          ) : null}
        </Tabs>
      </AppBar>
      <TabPanel value={tabValue} index={SearchResultType.Videos}>
        <List dense={true}>{videoList}</List>
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Playlists}>
        <List dense={true}>{playlistList}</List>
      </TabPanel>
    </>
  );
};

export default Search;
