import { ThumbsUpIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { PluginFrameContainer } from "../PluginsContext";
import { VideoComment } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import PluginCommentReplies from "./PluginCommentReplies";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
    <div className="flex gap-4">
      <div>
        <Avatar>
          <AvatarImage alt={comment.author} src={image} />
          <AvatarFallback>{comment.author.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline">
          <div className="mr-2">{comment.author}</div>
          <div className="text-muted-foreground text-xs">{createdDate}</div>
        </div>
        <p>{comment.content}</p>
        <div className="flex items-center gap-5">
          {comment.likes ? (
            <div className="flex">
              <ThumbsUpIcon fontSize="small" />
              {numberFormatter.format(comment.likes)}
            </div>
          ) : null}
        </div>
        <div>{comment.replyCount && replyElement}</div>
      </div>
    </div>
  );
};

export default Comment;
