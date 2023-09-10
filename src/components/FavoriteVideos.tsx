import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { db } from "../database";
import useVideoMenu from "../hooks/useVideoMenu";
import VideoCards from "./VideoCards";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const FavoriteVideos: React.FC = () => {
  const videos = useLiveQuery(() => db.favoriteVideos.toArray());
  const { t } = useTranslation();

  const { openMenu } = useVideoMenu();

  return videos && videos.length > 0 ? (
    <VideoCards videos={videos || []} openMenu={openMenu} />
  ) : (
    <Typography>{t("noFavoriteVideos")}</Typography>
  );
};

export default FavoriteVideos;
