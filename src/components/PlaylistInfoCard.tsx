import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ImageInfo } from "../plugintypes";
import PlaylistImage from "./PlaylistImage";
import { buttonVariants } from "./ui/button";

interface PlaylistInfoCardProps {
  name: string;
  images?: ImageInfo[];
  isLive?: boolean;
  pluginId?: string;
  channelApiId?: string;
}

const PlaylistInfoCard: React.FC<PlaylistInfoCardProps> = (props) => {
  const { name, images, pluginId, channelApiId, isLive } = props;
  const { t } = useTranslation();
  const sanitizer = DOMPurify.sanitize;

  return (
    <div className="flex">
      <div>
        <PlaylistImage images={images} />
      </div>
      <div>
        <h3
          className="text-2xl"
          dangerouslySetInnerHTML={{
            __html: sanitizer(name),
          }}
        />
        {isLive && (
          <Link
            className={cn(
              buttonVariants({ variant: "destructive" }),
              "rounded-full"
            )}
            to={`/plugins/${pluginId}/channels/${channelApiId}/live`}
          >
            {t("live")}
          </Link>
        )}
      </div>
    </div>
  );
};

export default PlaylistInfoCard;
