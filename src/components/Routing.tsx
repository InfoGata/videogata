import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
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
      </Routes>
    </Box>
  );
};

export default Routing;
