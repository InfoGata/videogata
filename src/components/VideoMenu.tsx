import AddPlaylistDialog from "@/components/AddPlaylistDialog";
import DropdownItem, { DropdownItemProps } from "@/components/DropdownItem";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/database";
import { cn } from "@/lib/utils";
import { Video } from "@/plugintypes";
import { useAppSelector } from "@/store/hooks";
import {
  MoreVertical,
  MoreHorizontal,
  StarIcon,
  StarOffIcon,
  ListPlusIcon,
  ExternalLink,
} from "lucide-react";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { MdSubscriptions } from "react-icons/md";
import PlaylistSubMenu from "./PlaylistSubMenu";

interface Props {
  video: Video;
  isListVideo?: boolean;
  dropdownItems?: DropdownItemProps[];
}

const VideoMenu: React.FC<Props> = (props) => {
  const { video, isListVideo, dropdownItems } = props;
  const { t } = useTranslation();
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const addVideoToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
  };
  const playlists = useAppSelector((state) => state.playlist.playlists);

  const favoriteTrack = async () => {
    if (video) {
      await db.favoriteVideos.add(video);
      enqueueSnackbar(t("addedToFavorites"));
    }
  };

  const removeFavorite = async () => {
    if (video.id) {
      await db.favoriteVideos.delete(video.id);
      enqueueSnackbar(t("removedFromFavorites"));
    }
  };

  const items: (DropdownItemProps | undefined)[] = [
    {
      title: isFavorited ? t("removeFromFavorites") : t("addToFavorites"),
      icon: isFavorited ? <StarOffIcon /> : <StarIcon />,
      action: isFavorited ? removeFavorite : favoriteTrack,
    },
    video.channelApiId
      ? {
          title: t("goToChannel"),
          icon: <MdSubscriptions />,
          internalPath: `/plugins/${video.pluginId}/channels/${video.channelApiId}`,
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

  const onOpenChange = async (open: boolean) => {
    setOpen(open);
    if (open) {
      if (video.pluginId && video.apiId) {
        const hasFavorite = await db.favoriteVideos.get({
          pluginId: video.pluginId,
          apiId: video.apiId,
        });
        setIsFavorited(!!hasFavorite);
      } else if (video.id) {
        const hasFavorite = await db.favoriteVideos.get(video.id);
        setIsFavorited(!!hasFavorite);
      } else {
        setIsFavorited(false);
      }
    }
  };

  const definedItems = items.filter((i): i is DropdownItemProps => !!i);
  return (
    <>
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              !isListVideo && "invisible group-hover:visible",
              open && "visible"
            )}
          >
            {isListVideo ? (
              <MoreHorizontal className="h-4 w-4" />
            ) : (
              <MoreVertical className="h-4 w-4" />
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
