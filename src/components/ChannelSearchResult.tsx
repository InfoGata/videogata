import { MoreHoriz } from "@mui/icons-material";
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  ListItemButton,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useItemMenu from "../hooks/useItemMenu";
import { Channel } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import { useTranslation } from "react-i18next";

interface ChannelSearchResultProps {
  channel: Channel;
  pluginId: string;
}

const ChannelSearchResult: React.FC<ChannelSearchResultProps> = (props) => {
  const { channel, pluginId } = props;
  const sanitizer = DOMPurify.sanitize;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { openMenu } = useItemMenu();
  const openChannelMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu) {
      openMenu(event, { type: "channel", item: channel });
    }
  };

  const image = getThumbnailImage(channel.images, searchThumbnailSize);

  const onLiveClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    const url = `/plugins/${pluginId}/channels/${channel.apiId}/live`;
    navigate(url);
  };

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={`/plugins/${pluginId}/channels/${channel.apiId}`}
        state={channel}
      >
        <ListItemAvatar>
          <Avatar alt={channel.name} src={image} style={{ borderRadius: 0 }} />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography
              dangerouslySetInnerHTML={{
                __html: sanitizer(channel?.name || ""),
              }}
            />
          }
        />
        {channel.isLive && (
          <Chip
            label={t("live")}
            color="error"
            clickable
            onClick={onLiveClick}
          />
        )}
      </ListItemButton>
      <ListItemSecondaryAction>
        <IconButton onClick={openChannelMenu} size="large">
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default ChannelSearchResult;
