import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { db } from "../database";
import useVideoMenu from "../hooks/useVideoMenu";
import VideoCards from "./VideoCards";

const FavoriteVideos: React.FC = () => {
  const videos = useLiveQuery(() => db.favoriteVideos.toArray());

  const { openMenu } = useVideoMenu();

  return <VideoCards videos={videos || []} openMenu={openMenu} />;
};

export default FavoriteVideos;
