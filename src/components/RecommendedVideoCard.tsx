import { Video } from "@/plugintypes";
import { getThumbnailImage, playlistThumbnailSize } from "@/utils";
import React from "react";
import { Link } from "react-router-dom";

interface Props {
  video: Video;
}

const RecommendedVideoCard: React.FC<Props> = (props) => {
  const { video } = props;
  const image = getThumbnailImage(video.images, playlistThumbnailSize);
  const url = `/plugins/${video.pluginId}/videos/${video.apiId}`;

  return (
    <Link to={url} className="flex gap-2">
      <div className="relative">
        <img src={image} className="h-32 rounded-lg" />
      </div>
      <div className="text-xs">
        <h3 className="font-medium text-sm mb-1.5">{video.title}</h3>
        <p>{video.channelName}</p>
        <p></p>
      </div>
    </Link>
  );
};

export default RecommendedVideoCard;
