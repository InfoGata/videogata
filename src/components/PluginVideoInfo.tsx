import DOMPurify from "dompurify";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Video } from "../plugintypes";
import VideoDescrption from "./VideoDescrption";
import VideoMenu from "./VideoMenu";
import { buttonVariants } from "./ui/button";
import { Separator } from "./ui/separator";

interface PluginVideoInfoProps {
  video: Video;
}

const PluginVideoInfo: React.FC<PluginVideoInfoProps> = (props) => {
  const { video } = props;
  const { t } = useTranslation();
  const channelUrl = `/plugins/${video.pluginId}/channels/${video.channelApiId}`;
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });
  const uploadDate =
    video.uploadDate &&
    new Date(video.uploadDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const sanitizer = DOMPurify.sanitize;

  return (
    <div>
      <h3
        className="text-2xl"
        dangerouslySetInnerHTML={{
          __html: sanitizer(video.title),
        }}
      />
      <div className="flex justify-between">
        <div>
          {video.views &&
            t("numberOfViews", {
              viewCount: numberFormatter.format(video.views),
            })}
          {<div>{uploadDate}</div>}
        </div>
        <div>
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
          {video.originalUrl ? (
            <a
              className={buttonVariants({ variant: "link" })}
              href={video.originalUrl}
              target="_blank"
            >
              {t("linkToOriginal")}
            </a>
          ) : null}
        </div>
      </div>
      <div>
        <VideoMenu video={video} notCardVideo />
      </div>
      {video.channelName ? (
        <Link className={buttonVariants({ variant: "ghost" })} to={channelUrl}>
          {video.channelName}
        </Link>
      ) : null}
      <Separator />
      {video.description ? (
        <VideoDescrption description={video.description} />
      ) : null}
      <Separator />
    </div>
  );
};

export default PluginVideoInfo;
