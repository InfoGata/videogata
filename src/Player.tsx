import React from "react";
import { Video } from "./plugintypes";
import { Grid } from "@mui/material";
import { PluginFrameContainer } from "./PluginsContext";
import PluginPlayer from "./components/PluginPlayer";
import VideoPlayer from "./components/VideoPlayer";

type PlayerProps = {
  apiId?: string;
  video?: Video;
  plugin?: PluginFrameContainer;
  usePlayer: boolean;
};

const Player: React.FC<PlayerProps> = (props) => {
  const { apiId, video, usePlayer, plugin } = props;

  return (
    <Grid>
      {video && !usePlayer ? <VideoPlayer video={video} /> : null}
      {usePlayer && <PluginPlayer apiId={apiId} plugin={plugin} />}
    </Grid>
  );
};
export default Player;
