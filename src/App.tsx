import { Box, Button, CssBaseline } from "@mui/material";
import { SnackbarKey, SnackbarProvider } from "notistack";
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
  const notistackRef = React.createRef<SnackbarProvider>();
  const onClickDismiss = (key: SnackbarKey) => () => {
    notistackRef?.current?.closeSnackbar(key);
  };

  return (
    <SnackbarProvider
      maxSnack={3}
      ref={notistackRef}
      action={(key) => <Button onClick={onClickDismiss(key)}>Dismiss</Button>}
    >
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
    </SnackbarProvider>
  );
};

export default App;
