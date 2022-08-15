import React from "react";
import { Video } from "../plugintypes";

const useVideoMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuVideo, setMenuVideo] = React.useState<Video>();

  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    video: Video
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setMenuVideo(video);
  };
  const closeMenu = () => setAnchorEl(null);

  return { closeMenu, openMenu, anchorEl, menuVideo };
};

export default useVideoMenu;
