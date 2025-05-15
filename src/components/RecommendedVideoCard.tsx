import { Video } from "@/plugintypes";
import { getThumbnailImage } from "@infogata/utils";
import { playlistThumbnailSize } from "@/utils";
import { Link } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import TimeAgo from "timeago-react";

interface Props {
  video: Video;
}

const RecommendedVideoCard: React.FC<Props> = (props) => {
  const { video } = props;
  const image = getThumbnailImage(video.images, playlistThumbnailSize);
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });
  const { t } = useTranslation();

  return (
    <Link
      to="/plugins/$pluginId/videos/$apiId"
      params={{ pluginId: video.pluginId || "", apiId: video.apiId || "" }}
      className="flex gap-2"
    >
      <img src={image} className="h-32 rounded-lg" />
      <div className="text-xs">
        <h3 className="font-medium text-sm mb-1.5">{video.title}</h3>
        <p>{video.channelName}</p>
        <p>
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
    </Link>
  );
};

export default RecommendedVideoCard;
