import React from "react";
import { PlaylistInfo, Video } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import VideoMenuContext from "../VideoMenuContext";

interface VideoMenuArgs {
  playlists?: PlaylistInfo[];
  listItems?: JSX.Element[];
}

const useVideoMenu = (args?: VideoMenuArgs) => {
  const { openVideoMenu, menuVideo, setPlaylists, setListElements } =
    React.useContext(VideoMenuContext);
  const playlists = useAppSelector((state) => state.playlist.playlists);

  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    video: Video
  ) => {
    openVideoMenu(event, video);
    setPlaylists(args?.playlists ?? playlists);
    setListElements(args?.listItems ?? []);
  };

  return { openMenu, menuVideo };
};

export default useVideoMenu;
