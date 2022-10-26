import {
  AppBar,
  Backdrop,
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useLocation } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { SearchResultType } from "../types";
import SelectPlugin from "./SelectPlugin";
import { Channel, PlaylistInfo, SearchAllResult, Video } from "../plugintypes";
import VideoSearchResults from "./VideoSearchResults";
import ChannelSearchResults from "./ChannelSearchResults";
import PlaylistSearchResults from "./PlaylistSearchResults";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";
  const queryClient = useQueryClient();

  const onSearch = async () => {
    let searchAll: SearchAllResult | undefined;
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin && (await plugin.hasDefined.onSearchAll())) {
      searchAll = await plugin.remote.onSearchAll({ query: searchQuery });
    }

    if (searchAll?.videos) {
      setTabValue(SearchResultType.Videos);
    } else if (searchAll?.playlists) {
      setTabValue(SearchResultType.Playlists);
    } else if (searchAll?.channels) {
      setTabValue(SearchResultType.Channels);
    }

    queryClient.setQueryData<Video[] | undefined>(
      ["searchVideos", pluginId, searchQuery, undefined],
      searchAll?.videos?.items
    );
    queryClient.setQueryData<Channel[] | undefined>(
      ["searchChannels", pluginId, searchQuery, undefined],
      searchAll?.channels?.items
    );
    queryClient.setQueryData<PlaylistInfo[] | undefined>(
      ["searchPlaylists", pluginId, searchQuery, undefined],
      searchAll?.playlists?.items
    );

    return searchAll;
  };

  const query = useQuery(["search", pluginId, searchQuery], onSearch);
  const videoList = query?.data?.videos?.items || [];
  const channelList = query?.data?.channels?.items || [];
  const playlistList = query?.data?.playlists?.items || [];

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
          {videoList.length > 0 ? (
            <Tab label={t("videos")} value={SearchResultType.Videos} />
          ) : null}
          {channelList.length > 0 ? (
            <Tab label={t("channels")} value={SearchResultType.Channels} />
          ) : null}
          {playlistList.length > 0 ? (
            <Tab label={t("playlists")} value={SearchResultType.Playlists} />
          ) : null}
        </Tabs>
      </AppBar>
      <TabPanel value={tabValue} index={SearchResultType.Videos}>
        <VideoSearchResults
          pluginId={pluginId}
          searchQuery={searchQuery}
          initialPage={query.data?.videos?.pageInfo}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Channels}>
        <ChannelSearchResults
          pluginId={pluginId}
          searchQuery={searchQuery}
          initialPage={query.data?.channels?.pageInfo}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={SearchResultType.Playlists}>
        <PlaylistSearchResults
          pluginId={pluginId}
          searchQuery={searchQuery}
          initialPage={query.data?.playlists?.pageInfo}
        />
      </TabPanel>
    </>
  );
};

export default Search;
