import DOMPurify from "dompurify";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Video } from "../plugintypes";
import VideoDescrption from "./VideoDescrption";
import VideoMenu from "./VideoMenu";
import { Button } from "./ui/button";
import TimeAgo from "timeago-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface PluginVideoInfoProps {
  video: Video;
}

const PluginVideoInfo: React.FC<PluginVideoInfoProps> = (props) => {
  const { video } = props;
  const { t } = useTranslation();
  const [showMore, setShowMore] = React.useState(false);
  const channelUrl = `/plugins/${video.pluginId}/channels/${video.channelApiId}`;
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const sanitizer = DOMPurify.sanitize;

  return (
    <div>
      <h3
        className="text-2xl"
        dangerouslySetInnerHTML={{
          __html: sanitizer(video.title),
        }}
      />
      <div className="flex gap-4">
        <div className="flex items-center justify-between w-full">
          <Link to={channelUrl} className="text-muted-foreground">
            {video.channelName}
          </Link>
          {video.likes ? (
            <div>
              <ThumbsUpIcon />
              {numberFormatter.format(video.likes)}
            </div>
          ) : null}
          {video.dislikes ? (
            <div>
              <ThumbsDownIcon />
              {numberFormatter.format(video.dislikes)}
            </div>
          ) : null}
        </div>
        <VideoMenu video={video} notCardVideo />
      </div>
      <div
        className={cn(
          "mb-5 bg-muted relative overflow-hidden text-sm rounded-lg p-3",
          !showMore && "h-20"
        )}
      >
        <div className="space-x-2">
          <span>
            {video.views &&
              t("numberOfViews", {
                viewCount: numberFormatter.format(video.views),
              })}
          </span>
          {video.uploadDate && (
            <span>
              <TimeAgo datetime={video.uploadDate} />
            </span>
          )}
        </div>
        {video.description ? (
          <VideoDescrption description={video.description} />
        ) : null}
        <Button
          onClick={toggleShowMore}
          variant="ghost"
          className="absolute bottom-1 right-1"
          size="sm"
        >
          {showMore ? t("showLess") : t("showMore")}
        </Button>
      </div>
    </div>
  );
};

export default PluginVideoInfo;
