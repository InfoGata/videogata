import { ThumbUp } from "@mui/icons-material";
import { Avatar, Button, Grid, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
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
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });
  const { t } = useTranslation();

  const onLoadReplies = () => {
    setLoadReplies(true);
  };

  const replyElement = loadReplies ? (
    <PluginCommentReplies comment={comment} plugin={plugin} />
  ) : (
    <Button onClick={onLoadReplies} size="small">
      {t("viewReplies")}
    </Button>
  );
  const createdDate =
    comment.createdDate &&
    new Date(comment.createdDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Grid container wrap="nowrap" spacing={2}>
      <Grid item>
        <Avatar alt={comment.author} src={image} />
      </Grid>
      <Grid justifyContent="left" item xs zeroMinWidth>
        <Typography variant="body1" style={{ margin: 0, textAlign: "left" }}>
          {comment.author}
        </Typography>
        <Typography color="textSecondary" variant="subtitle2">
          {createdDate}
        </Typography>
        <Typography color="textSecondary" variant="body1">
          {comment.content}
        </Typography>
        {comment.likes && (
          <Grid item container>
            <ThumbUp fontSize="small" />
            <Typography variant="body2">
              {numberFormatter.format(comment.likes)}
            </Typography>
          </Grid>
        )}
        <Grid item>{comment.replyCount && replyElement}</Grid>
      </Grid>
    </Grid>
  );
};

export default Comment;
