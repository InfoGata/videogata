import { Channel } from "@/plugintypes";
import { ItemMenuType } from "@/types";
import { getThumbnailImage, searchThumbnailSize } from "@/utils";
import React from "react";
import { useTranslation } from "react-i18next";
import ItemMenu from "./ItemMenu";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link, useNavigate } from "@tanstack/react-router";

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
    navigate({
      to: "/plugins/$pluginId/channels/$apiId/live",
      params: { pluginId: channel.pluginId || "", apiId: channel.apiId || "" },
    });
  };

  return (
    <Link
      to="/plugins/$pluginId/channels/$apiId"
      params={{ pluginId: channel.pluginId || "", apiId: channel.apiId || "" }}
      state={{ channel }}
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
