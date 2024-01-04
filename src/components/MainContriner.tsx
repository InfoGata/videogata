import { Box } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import React from "react";
import { Outlet } from "react-router-dom";
import MiniPlayer from "./MiniPlayer";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const MainContainer: React.FC = () => {
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
      <Outlet />
    </Box>
  );
};

export default MainContainer;
