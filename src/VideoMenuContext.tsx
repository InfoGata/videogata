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

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const VideoMenuContext = React.createContext<VideoMenuInterface>(undefined!);

export default VideoMenuContext;
