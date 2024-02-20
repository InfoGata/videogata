import { Channel } from "@/plugintypes";
import { ItemMenuType } from "@/types";
import { getThumbnailImage, searchThumbnailSize } from "@/utils";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import ItemMenu from "./ItemMenu";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

type Props = {
  channel: Channel;
};

const ChannelListItem: React.FC<Props> = (props) => {
  const { channel } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const image = getThumbnailImage(channel.images, searchThumbnailSize);
  const itemType: ItemMenuType = { type: "channel", item: channel };

  const onLiveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const url = `/plugins/${channel.pluginId}/channels/${channel.apiId}/live`;
    navigate(url);
  };

  return (
    <Link
      to={`/plugins/${channel.pluginId}/channels/${channel.apiId}`}
      state={channel}
      className="flex items-center transition-all hover:bg-accent hover:text-accent-foreground p-2"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={image} />
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{channel.name}</p>
      </div>
      <div className="ml-auto font-medium">
        {channel.isLive && (
          <Button
            className="rounded-full"
            variant="destructive"
            onClick={onLiveClick}
          >
            {t("live")}
          </Button>
        )}
        <ItemMenu itemType={itemType} />
      </div>
    </Link>
  );
};

export default ChannelListItem;
