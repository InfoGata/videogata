import AddPlaylistDialog from "@/components/AddPlaylistDialog";
import DropdownItem, { DropdownItemProps } from "@/components/DropdownItem";
import DropdownPlaylistMenuItem from "@/components/DropdownPlaylistMenuItem";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/database";
import { cn } from "@/lib/utils";
import { Video } from "@/plugintypes";
import { useAppSelector } from "@/store/hooks";
import {
  Link as LinkIcon,
  PlaylistAdd,
  Subscriptions,
} from "@mui/icons-material";
import { MoreVertical } from "lucide-react";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaRegStar, FaStar } from "react-icons/fa6";

interface Props {
  video: Video;
}

const VideoMenu: React.FC<Props> = (props) => {
  const { video } = props;
  const { t } = useTranslation();
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const addVideoToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
  };
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
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
      icon: isFavorited ? <FaRegStar /> : <FaStar />,
      action: isFavorited ? removeFavorite : favoriteTrack,
    },
    video.channelApiId
      ? {
          title: t("goToChannel"),
          icon: <Subscriptions />,
          internalPath: `/plugins/${video.pluginId}/channels/${video.channelApiId}`,
        }
      : undefined,
    video.originalUrl
      ? {
          title: t("originalUrl"),
          icon: <LinkIcon />,
          url: video.originalUrl,
        }
      : undefined,
    {
      title: t("addToNewPlaylist"),
      icon: <PlaylistAdd />,
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
            className={cn("invisible group-hover:visible", open && "visible")}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {definedItems.map((i) => (
            <DropdownItem key={i.title} {...i}></DropdownItem>
          ))}
          {playlists.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <PlaylistAdd />
                <span>{t("addToPlaylist")}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {playlists.map((p) => (
                    <DropdownPlaylistMenuItem
                      key={p.id}
                      playlist={p}
                      videos={[video]}
                    />
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AddPlaylistDialog
        videos={[video]}
        handleClose={closePlaylistDialog}
        open={playlistDialogOpen}
      />
    </>
  );
};

export default VideoMenu;
