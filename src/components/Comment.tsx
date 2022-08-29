import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import React from "react";
import { VideoComment } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface CommentProps {
  comment: VideoComment;
}

const Comment: React.FC<CommentProps> = (props) => {
  const { comment } = props;
  const image = getThumbnailImage(comment.images, searchThumbnailSize);

  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt={comment.author} src={image} />
      </ListItemAvatar>
      <ListItemText primary={comment.author} secondary={comment.content} />
    </ListItem>
  );
};

export default Comment;
