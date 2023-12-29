import { Box } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import React from "react";
import { Route, Routes } from "react-router-dom";
import AboutPage from "../pages/AboutPage";
import ChannelPage from "../pages/ChannelPage";
import Donate from "../pages/Donate";
import FavoriteChannels from "../pages/FavoriteChannels";
import FavoritePlaylists from "../pages/FavoritePlaylists";
import FavoriteVideos from "../pages/FavoriteVideos";
import Favorites from "../pages/Favorites";
import Home from "../pages/Home";
import PlaylistVideos from "../pages/PlaylistVideos";
import Playlists from "../pages/Playlists";
import PluginDetails from "../pages/PluginDetails";
import PluginInstall from "../pages/PluginInstall";
import PluginLive from "../pages/PluginLive";
import PluginOptions from "../pages/PluginOptions";
import PluginPlaylist from "../pages/PluginPlaylist";
import PluginPlaylists from "../pages/PluginPlaylists";
import PluginVideo from "../pages/PluginVideo";
import Plugins from "../pages/Plugins";
import Privacy from "../pages/Privacy";
import Search from "../pages/Search";
import Settings from "../pages/Settings";
import UserPluginChannels from "../pages/UserPluginChannels";
import MiniPlayer from "./MiniPlayer";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Routing: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 1,
        overflow: "auto",
        minHeight: `calc(100vh - ${theme.spacing(3)})`,
      }}
    >
      <DrawerHeader />
      <MiniPlayer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/plugininstall" element={<PluginInstall />} />
        <Route path="/search" element={<Search />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/favorites" element={<Favorites />}>
          <Route index element={<FavoriteVideos />} />
          <Route path="videos" element={<FavoriteVideos />} />
          <Route path="channels" element={<FavoriteChannels />} />
          <Route path="playlists" element={<FavoritePlaylists />} />
        </Route>
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/playlists/:playlistId" element={<PlaylistVideos />} />
        <Route
          path="/plugins/:pluginId/videos/:apiId"
          element={<PluginVideo />}
        />
        <Route
          path="/plugins/:pluginId/channels/:apiId/live"
          element={<PluginLive />}
        />
        <Route
          path="/plugins/:pluginId/playlists"
          element={<PluginPlaylists />}
        />
        <Route
          path="/plugins/:pluginId/playlists/:apiId"
          element={<PluginPlaylist />}
        />
        <Route
          path="/plugins/:pluginId/channels"
          element={<UserPluginChannels />}
        />
        <Route
          path="/plugins/:pluginId/channels/:apiId"
          element={<ChannelPage />}
        />
        <Route path="/plugins/:pluginId" element={<PluginDetails />} />
        <Route path="/plugins/:pluginId/options" element={<PluginOptions />} />
      </Routes>
    </Box>
  );
};

export default Routing;
