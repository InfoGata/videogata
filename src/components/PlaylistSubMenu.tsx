import { PlaylistInfo, Video } from "@/plugintypes";
import React from "react";
import DropdownPlaylistMenuItem from "./DropdownPlaylistMenuItem";
import {
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";

type Props = {
  title: string;
  playlists: PlaylistInfo[];
  videos: Video[];
};

const PlaylistSubMenu: React.FC<Props> = (props) => {
  const { playlists, videos, title } = props;

  return playlists.length > 0 ? (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <span>{title}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {playlists.map((p) => (
            <DropdownPlaylistMenuItem key={p.id} playlist={p} videos={videos} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  ) : null;
};

export default PlaylistSubMenu;
