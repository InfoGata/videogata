import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ThumbsUpIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { PluginFrameContainer } from "../PluginsContext";
import { VideoComment } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import PluginCommentReplies from "./PluginCommentReplies";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";

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
    <Button variant="ghost" onClick={onLoadReplies}>
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
    <div className="flex">
      <div>
        <Avatar>
          <AvatarImage alt={comment.author} src={image} />
          <AvatarFallback>{comment.author.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </div>
      <div>
        <div className="m-0 text-left">{comment.author}</div>
        <div className="text-muted-foreground text-sm">{createdDate}</div>
        <div>{comment.content}</div>
        {comment.likes ? (
          <div className="flex">
            <ThumbsUpIcon fontSize="small" />
            {numberFormatter.format(comment.likes)}
          </div>
        ) : null}
        <div>{comment.replyCount && replyElement}</div>
      </div>
    </div>
  );
};

export default Comment;
