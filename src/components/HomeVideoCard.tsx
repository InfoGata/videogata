import { Video } from "@/plugintypes";
import { formatSeconds, getThumbnailImage } from "@infogata/utils";
import { playlistThumbnailSize } from "@/utils";
import React from "react";
import { useTranslation } from "react-i18next";
import TimeAgo from "timeago-react";
import DOMPurify from "dompurify";
import VideoMenu from "./VideoMenu";
import { Link } from "@tanstack/react-router";

interface Props {
  video: Video;
}

const HomeVideoCard: React.FC<Props> = (props) => {
  const { video } = props;
  const { t } = useTranslation();
  const image = getThumbnailImage(video.images, playlistThumbnailSize);
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });
  const sanitizer = DOMPurify.sanitize;

  return (
    <div className="group">
      <Link
        to="/plugins/$pluginId/videos/$apiId"
        params={{ pluginId: video.pluginId || "", apiId: video.apiId || "" }}
        className="relative block"
      >
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
            <Link
              to="/plugins/$pluginId/videos/$apiId"
              params={{
                pluginId: video.pluginId || "",
                apiId: video.apiId || "",
              }}
            >
              <h3
                className="font-medium"
                dangerouslySetInnerHTML={{ __html: sanitizer(video.title) }}
              />
            </Link>
            <VideoMenu video={video} />
          </div>
          <Link
            to="/plugins/$pluginId/channels/$apiId"
            params={{
              pluginId: video.pluginId || "",
              apiId: video.channelApiId || "",
            }}
            className="text-muted-foreground text-sm"
          >
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
