import DOMPurify from "dompurify";
import React from "react";
import { Video } from "../plugintypes";
import { formatSeconds, getThumbnailImage } from "@infogata/utils";
import { searchThumbnailSize } from "../utils";
import VideoMenu from "./VideoMenu";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { TableCell } from "./ui/table";
import { DropdownItemProps } from "./DropdownItem";
import { Link } from "@tanstack/react-router";

interface PlaylistItemsProps {
  video: Video;
  isSelected?: (id: string) => boolean;
  onSelectClick?: (event: React.MouseEvent, id: string, index: number) => void;
  index?: number;
  playlistId?: string;
  menuItems?: DropdownItemProps[];
}

const PlaylistItem: React.FC<PlaylistItemsProps> = (props) => {
  const { video, onSelectClick, isSelected, index, playlistId, menuItems } =
    props;
  const sanitizer = DOMPurify.sanitize;

  let videoUrl = `/plugins/${video.pluginId}/videos/${video.apiId}`;
  videoUrl = playlistId
    ? `${videoUrl}?playlistId=${playlistId}&videoId=${video.id}`
    : videoUrl;

  const onCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectClick && index !== undefined) {
      onSelectClick(e, video.id || "", index);
    }
  };

  const image = getThumbnailImage(video.images, searchThumbnailSize);

  return (
    <>
      {isSelected && (
        <TableCell>
          {
            <Checkbox
              checked={isSelected(video.id || "")}
              onClick={onCheckboxClick}
            />
          }
        </TableCell>
      )}
      <TableCell>
        <div className="flex">
          <Avatar className="rounded-none">
            <AvatarImage src={image} />
          </Avatar>
          <div className="min-w-0">
            <Link to={videoUrl}>
              <p
                dangerouslySetInnerHTML={{ __html: sanitizer(video.title) }}
                title={video.title}
                className="truncate"
              />
            </Link>
            {video.channelApiId ? (
              <Link
                to="/plugins/$pluginId/channels/$apiId"
                params={{
                  pluginId: video.pluginId || "",
                  apiId: video.channelApiId || "",
                }}
              >
                {video.channelName}
              </Link>
            ) : (
              <p
                className="truncate"
                dangerouslySetInnerHTML={{
                  __html: sanitizer(video.channelName || ""),
                }}
              />
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {formatSeconds(video.duration)}
      </TableCell>
      <TableCell align="right">
        <VideoMenu
          video={video}
          notCardVideo={true}
          dropdownItems={menuItems}
        />
      </TableCell>
    </>
  );
};

export default React.memo(PlaylistItem);
