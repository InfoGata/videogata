import { Channel } from "@/plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "@/utils";
import React from "react";
import { AvatarImage, Avatar } from "./ui/avatar";
import ItemMenu from "./ItemMenu";
import { ItemMenuType } from "@/types";
import { Link } from "react-router-dom";

type Props = {
  channel: Channel;
};

const ChannelListItem: React.FC<Props> = (props) => {
  const { channel } = props;
  const image = getThumbnailImage(channel.images, searchThumbnailSize);
  const itemType: ItemMenuType = { type: "channel", item: channel };
  return (
    <Link
      to={`/plugins/${channel.pluginId}/channels/${channel.apiId}`}
      className="flex items-center transition-all hover:bg-accent hover:text-accent-foreground p-2"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={image} />
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{channel.name}</p>
      </div>
      <div className="ml-auto font-medium">
        <ItemMenu itemType={itemType} />
      </div>
    </Link>
  );
};

export default ChannelListItem;
