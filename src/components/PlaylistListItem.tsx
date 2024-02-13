import { getThumbnailImage, searchThumbnailSize } from "@/utils";
import React from "react";
import { AvatarImage, Avatar } from "./ui/avatar";
import ItemMenu from "./ItemMenu";
import { ItemMenuType } from "@/types";
import { Link } from "react-router-dom";
import { PlaylistInfo } from "@/plugintypes";
import { DropdownItemProps } from "./DropdownItem";

type Props = {
  playlist: PlaylistInfo;
  dropdownItems?: DropdownItemProps[];
  noFavorite?: boolean;
};

const PlaylistListItem: React.FC<Props> = (props) => {
  const { playlist, dropdownItems, noFavorite } = props;
  const image = getThumbnailImage(playlist.images, searchThumbnailSize);
  const itemType: ItemMenuType = { type: "playlist", item: playlist };
  const playlistPath = `/playlists/${props.playlist.id}`;

  return (
    <Link
      to={playlistPath}
      className="flex items-center transition-all hover:bg-accent hover:text-accent-foreground p-2"
    >
      <Avatar className="h-10 w-10 rounded-none">
        <AvatarImage src={image} />
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{playlist.name}</p>
      </div>
      <div className="ml-auto font-medium">
        <ItemMenu
          itemType={itemType}
          dropdownItems={dropdownItems}
          noFavorite={noFavorite}
        />
      </div>
    </Link>
  );
};

export default PlaylistListItem;
