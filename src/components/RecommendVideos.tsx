import { Grid, Menu } from "@mui/material";
import React from "react";
import useVideoMenu from "../hooks/useVideoMenu";
import { Video } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import PlaylistMenuItem from "./PlaylistMenuItem";
import VideoCard from "./VideoCard";

interface RecommendedVideosProps {
  videos: Video[];
  pluginId: string;
}

const RecommendedVideos: React.FC<RecommendedVideosProps> = (props) => {
  const { videos, pluginId } = props;
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const { closeMenu, openMenu, anchorEl, menuVideo } = useVideoMenu();

  const recommendations = videos.map((v) => (
    <VideoCard
      key={v.apiId}
      pluginId={pluginId}
      video={v}
      openMenu={openMenu}
    />
  ));

  return (
    <>
      <Grid item xs={3}>
        {recommendations}
      </Grid>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            videos={menuVideo ? [menuVideo] : []}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
    </>
  );
};

export default RecommendedVideos;
