import React from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { PlaylistInfo, Video } from "@/plugintypes";
import { addPlaylistVideos } from "../store/reducers/playlistReducer";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "sonner";

type Props = {
  playlist: PlaylistInfo;
  videos: Video[];
};

const DropdownPlaylistMenuItem: React.FC<Props> = (props) => {
  const { playlist, videos } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const addToPlaylist = () => {
    if (playlist.id) {
      dispatch(addPlaylistVideos(playlist, videos));
      toast(
        t("addedVideosToPlaylist", {
          playlistName: playlist.name,
          count: videos.length,
        })
      );
    }
  };
  return (
    <DropdownMenuItem className="cursor-pointer" onSelect={addToPlaylist}>
      <span>{playlist.name}</span>
    </DropdownMenuItem>
  );
};

export default DropdownPlaylistMenuItem;
