import { Video } from "@/plugintypes";
import {
  formatSeconds,
  getThumbnailImage,
  playlistThumbnailSize,
} from "@/utils";
import { MoreVertical } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import TimeAgo from "timeago-react";
import { Button } from "./ui/button";
import DOMPurify from "dompurify";

interface Props {
  video: Video;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, video: Video) => void;
}

const HomeVideoCard: React.FC<Props> = (props) => {
  const { video, openMenu } = props;
  const { t } = useTranslation();
  const image = getThumbnailImage(video.images, playlistThumbnailSize);
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });
  const sanitizer = DOMPurify.sanitize;

  const url = `/plugins/${video.pluginId}/videos/${video.apiId}`;
  const channelUrl = `/plugins/${video.pluginId}/channels/${video.channelApiId}`;

  const openVideoMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, video);
  };

  return (
    <div key={video.id} className="group">
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
            <Button
              variant="ghost"
              size="icon"
              className="invisible group-hover:visible focus:visible"
              onClick={openVideoMenu}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
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
