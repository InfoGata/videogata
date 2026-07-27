import { getThumbnailImage } from "@infogata/utils";
import { searchThumbnailSize } from "@/utils";
import React from "react";
import { AvatarImage, Avatar } from "./ui/avatar";
import ItemMenu from "./ItemMenu";
import { ItemMenuType } from "@/types";
import { PlaylistInfo } from "@/plugintypes";
import { DropdownItemProps } from "./DropdownItem";
import { Link } from "@tanstack/react-router";

type Props = {
  playlist: PlaylistInfo;
  dropdownItems?: DropdownItemProps[];
  noFavorite?: boolean;
  isUserPlaylist?: boolean;
};

const PlaylistListItem: React.FC<Props> = (props) => {
  const { playlist, dropdownItems, noFavorite, isUserPlaylist } = props;
  const image = getThumbnailImage(playlist.images, searchThumbnailSize);
  const itemType: ItemMenuType = { type: "playlist", item: playlist };
  const className =
    "flex items-center transition-all hover:bg-accent hover:text-accent-foreground p-2";

  // Params rather than a built path: the plugin route renders its `pluginId`
  // param as the plugin's url alias.
  const contents = (
    <>
      <Avatar className="size-10 rounded-none">
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
    </>
  );

  return playlist.pluginId ? (
    <Link
      to="/s/$pluginId/playlists/$apiId"
      params={{
        pluginId: playlist.pluginId,
        apiId: playlist.apiId || "",
      }}
      search={{ isUserPlaylist: isUserPlaylist ?? false }}
      className={className}
    >
      {contents}
    </Link>
  ) : (
    <Link
      to="/playlists/$playlistId"
      params={{ playlistId: playlist.id || "" }}
      className={className}
    >
      {contents}
    </Link>
  );
};

export default PlaylistListItem;
