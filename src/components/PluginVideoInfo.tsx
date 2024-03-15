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

interface PluginVideoInfoProps {
  video: Video;
}

const PluginVideoInfo: React.FC<PluginVideoInfoProps> = (props) => {
  const { video } = props;
  const { t } = useTranslation();
  const [showMore, setShowMore] = React.useState(false);
  // const channelUrl = `/plugins/${video.pluginId}/channels/${video.channelApiId}`;
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });
  // const uploadDate =
  //   video.uploadDate &&
  //   new Date(video.uploadDate).toLocaleDateString("en-US", {
  //     month: "long",
  //     day: "numeric",
  //     year: "numeric",
  //   });

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
          <div className="flex items-baseline">
            <h3 className="mr-2">{video.channelName}</h3>
            <span className="text-sm text-muted-foreground">
              {video.uploadDate && (
                <span>
                  <TimeAgo datetime={video.uploadDate} />
                </span>
              )}
            </span>
          </div>
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

        <div>
          <VideoMenu video={video} notCardVideo />
        </div>
      </div>

      {/* <div>
          {video.views &&
            t("numberOfViews", {
              viewCount: numberFormatter.format(video.views),
            })}
        </div> */}
      <div
        className={cn(
          "mb-5 bg-muted relative overflow-hidden text-sm rounded-lg p-3",
          !showMore && "h-20"
        )}
      >
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
