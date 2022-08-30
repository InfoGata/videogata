import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
} from "@mui/material";
import React from "react";
import { PluginFrameContainer } from "../PluginsContext";
import { VideoComment } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import PluginCommentReplies from "./PluginCommentReplies";

interface CommentProps {
  comment: VideoComment;
  plugin: PluginFrameContainer | undefined;
}

const Comment: React.FC<CommentProps> = (props) => {
  const { comment, plugin } = props;
  const image = getThumbnailImage(comment.images, searchThumbnailSize);
  const [loadReplies, setLoadReplies] = React.useState(false);

  const onLoadReplies = () => {
    setLoadReplies(true);
  };

  const replyElement = loadReplies ? (
    <PluginCommentReplies comment={comment} plugin={plugin} />
  ) : (
    <Button onClick={onLoadReplies}>View Replies</Button>
  );

  return (
    <>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt={comment.author} src={image} />
        </ListItemAvatar>
        <ListItemText primary={comment.author} secondary={comment.content} />
      </ListItem>
      {comment.replyCount && replyElement}
    </>
  );
};

export default Comment;
