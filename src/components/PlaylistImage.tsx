import { Image } from "mui-image";
import thumbnail from "../thumbnail.png";
import React from "react";
import { ImageInfo } from "../plugintypes";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";

interface PlaylistImageProps {
  images?: ImageInfo[];
}

const PlaylistImage: React.FC<PlaylistImageProps> = (props) => {
  const { images } = props;
  const image = getThumbnailImage(images, playlistThumbnailSize);
  return <Image src={image || thumbnail} height={playlistThumbnailSize} />;
};

export default PlaylistImage;
