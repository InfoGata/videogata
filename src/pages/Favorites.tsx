import { Tab, Tabs } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation } from "react-router-dom";

const Favorites: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <>
      <Tabs value={pathname}>
        <Tab
          label={t("videos")}
          value="/favorites/videos"
          to="videos"
          component={Link}
        />
        <Tab
          label={t("channels")}
          value="/favorites/channels"
          to="channels"
          component={Link}
        />
        <Tab
          label={t("playlists")}
          value="/favorites/playlists"
          to="playlists"
          component={Link}
        />
      </Tabs>
      <Outlet />
    </>
  );
};

export default Favorites;
