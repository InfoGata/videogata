import { Box, CssBaseline } from "@mui/material";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Routing from "./components/Routing";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";
import { PluginsProvider } from "./PluginsContext";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PluginsProvider>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <TopBar />
          <SideBar />
          <Routing />
        </Box>
      </PluginsProvider>
    </BrowserRouter>
  );
};

export default App;
