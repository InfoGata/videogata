import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  ListItemButton,
} from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";
import { Link } from "react-router-dom";
import { Channel } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface ChannelSearchResultProps {
  channel: Channel;
  pluginId: string;
}

const ChannelSearchResult: React.FC<ChannelSearchResultProps> = (props) => {
  const { channel, pluginId } = props;
  const sanitizer = DOMPurify.sanitize;

  const image = getThumbnailImage(channel.images, searchThumbnailSize);
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
      </ListItemButton>
    </ListItem>
  );
};

export default ChannelSearchResult;
