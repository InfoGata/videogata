import React from "react";
import { PlaylistInfo, Video } from "./plugintypes";

export interface VideoMenuInterface {
  openVideoMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    video: Video
  ) => Promise<void>;
  setPlaylists: React.Dispatch<React.SetStateAction<PlaylistInfo[]>>;
  setListElements: React.Dispatch<React.SetStateAction<JSX.Element[]>>;
}

const VideoMenuContext = React.createContext<VideoMenuInterface>(undefined!);

export default VideoMenuContext;
