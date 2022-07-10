import { Box, CssBaseline } from "@mui/material";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Routing from "./components/Routing";
import SideBar from "./components/SideBar";
import TopBar from "./components/TopBar";
import { PluginsProvider } from "./PluginsContext";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};

export default App;
