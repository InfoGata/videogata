import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import PluginDetails from "./PluginDetails";
import PluginOptions from "./PluginOptions";
import PluginPlaylist from "./PluginPlaylist";
import Plugins from "./Plugins";
import PluginVideo from "./PluginVideo";
import Search from "./Search";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Routing: React.FC = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 1, overflow: "auto" }}>
      <DrawerHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/search" element={<Search />} />
        <Route
          path="/plugins/:pluginId/videos/:apiId"
          element={<PluginVideo />}
        />
        <Route
          path="/plugins/:pluginId/playlists/:apiId"
          element={<PluginPlaylist />}
        />
        <Route path="/plugins/:pluginId" element={<PluginDetails />} />
        <Route path="/plugins/:pluginId/options" element={<PluginOptions />} />
      </Routes>
    </Box>
  );
};

export default Routing;
