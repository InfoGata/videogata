import { Video } from "@/plugintypes";
import {
  formatSeconds,
  getThumbnailImage,
  playlistThumbnailSize,
} from "@/utils";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import TimeAgo from "timeago-react";
import DOMPurify from "dompurify";
import VideoMenu from "./VideoMenu";

interface Props {
  video: Video;
}

const HomeVideoCard: React.FC<Props> = (props) => {
  const { video } = props;
  const { t } = useTranslation();
  const image = getThumbnailImage(video.images, playlistThumbnailSize);
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });
  const sanitizer = DOMPurify.sanitize;

  const url = `/plugins/${video.pluginId}/videos/${video.apiId}`;
  const channelUrl = `/plugins/${video.pluginId}/channels/${video.channelApiId}`;

  return (
    <div className="group">
      <Link to={url} className="relative block">
        <img
          src={image}
          className="rounded-2xl bg-gray-200 w-full h-64 object-cover"
        />
        <span className="absolute bottom-2 right-2 bg-gray-900 text-gray-50 text-sm px-1 rounded-sm">
          {formatSeconds(video.duration)}
        </span>
      </Link>
      <div className="mt-3">
        <div>
          <div className="flex justify-between">
            <Link to={url}>
              <h3
                className="font-medium"
                dangerouslySetInnerHTML={{ __html: sanitizer(video.title) }}
              />
            </Link>
            <VideoMenu video={video} />
          </div>
          <Link to={channelUrl} className="text-muted-foreground text-sm">
            {video.channelName}
          </Link>
          <p className="text-muted-foreground text-xs">
            {video.views && (
              <span>
                {t("numberOfViews", {
                  viewCount: numberFormatter.format(video.views),
                })}
                •
              </span>
            )}

            {video.uploadDate && (
              <span>
                <TimeAgo datetime={video.uploadDate} />
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeVideoCard;
