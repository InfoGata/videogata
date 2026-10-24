import AddPlaylistDialog from "@/components/AddPlaylistDialog";
import DropdownItem, { DropdownItemProps } from "@/components/DropdownItem";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Video } from "@/plugintypes";
import { addFavorite, removeFavorite } from "@/sync/library";
import { useIsFavorite, usePlaylists } from "@/sync/useLibrary";
import {
  MoreVertical,
  MoreHorizontal,
  StarIcon,
  StarOffIcon,
  ListPlusIcon,
  ExternalLink,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { MdSubscriptions } from "react-icons/md";
import PlaylistSubMenu from "./PlaylistSubMenu";
import { toast } from "sonner";

interface Props {
  video: Video;
  notCardVideo?: boolean;
  dropdownItems?: DropdownItemProps[];
}

const VideoMenu: React.FC<Props> = (props) => {
  const { video, notCardVideo, dropdownItems } = props;
  const { t } = useTranslation();
  const isFavorited = useIsFavorite("videos", video);
  const [open, setOpen] = React.useState(false);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const addVideoToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
  };
  const playlists = usePlaylists();

  const favoriteVideo = async () => {
    await addFavorite("videos", video);
    toast(t("addedToFavorites"));
  };

  const unfavoriteVideo = async () => {
    await removeFavorite("videos", video);
    toast(t("removedFromFavorites"));
  };

  const items: (DropdownItemProps | undefined)[] = [
    {
      title: isFavorited ? t("removeFromFavorites") : t("addToFavorites"),
      icon: isFavorited ? <StarOffIcon /> : <StarIcon />,
      action: isFavorited ? unfavoriteVideo : favoriteVideo,
    },
    video.channelApiId
      ? {
          title: t("goToChannel"),
          icon: <MdSubscriptions />,
          internalLink: {
            to: "/s/$pluginId/channels/$apiId",
            params: {
              pluginId: video.pluginId || "",
              apiId: video.channelApiId,
            },
          },
        }
      : undefined,
    video.originalUrl
      ? {
          title: t("originalUrl"),
          icon: <ExternalLink />,
          url: video.originalUrl,
        }
      : undefined,
    ...(dropdownItems || []),
    {
      title: t("addToNewPlaylist"),
      icon: <ListPlusIcon />,
      action: addVideoToNewPlaylist,
    },
  ];

  const definedItems = items.filter((i): i is DropdownItemProps => !!i);
  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              !notCardVideo && "invisible group-hover:visible",
              open && "visible"
            )}
          >
            {notCardVideo ? (
              <MoreHorizontal className="size-4" />
            ) : (
              <MoreVertical className="size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {definedItems.map((i) => (
            <DropdownItem
              key={i.title}
              {...i}
              item={{ type: "video", item: video }}
            />
          ))}
          <PlaylistSubMenu
            title={t("addToPlaylist")}
            playlists={playlists}
            videos={[video]}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <AddPlaylistDialog
        videos={[video]}
        setOpen={setPlaylistDialogOpen}
        open={playlistDialogOpen}
      />
    </>
  );
};

export default VideoMenu;
