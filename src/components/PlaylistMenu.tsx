import { ListPlusIcon, MoreHorizontalIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { PlaylistInfo, Video } from "../plugintypes";
import AddPlaylistDialog from "./AddPlaylistDialog";
import DropdownItem, { DropdownItemProps } from "./DropdownItem";
import PlaylistSubMenu from "./PlaylistSubMenu";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface PlaylistMenuProps {
  playlists: PlaylistInfo[];
  selected?: Set<string>;
  videoList: Video[];
  dropdownItems?: DropdownItemProps[];
  selectedDropdownItems?: DropdownItemProps[];
}

const PlaylistMenu: React.FC<PlaylistMenuProps> = (props) => {
  const {
    playlists,
    selected,
    videoList,
    dropdownItems,
    selectedDropdownItems,
  } = props;
  const { t } = useTranslation();

  const [playlistDialogVideos, setPlaylistDialogVideos] = React.useState<
    Video[]
  >([]);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);

  const selectedVideos = selected
    ? videoList.filter((t) => selected.has(t.id ?? ""))
    : [];

  const addSelectedToNewPlaylist = () => {
    setPlaylistDialogVideos(selectedVideos);
    setPlaylistDialogOpen(true);
  };

  const addToNewPlaylist = () => {
    setPlaylistDialogVideos(videoList);
    setPlaylistDialogOpen(true);
  };

  const items: (DropdownItemProps | undefined)[] = [
    ...(dropdownItems || []),
    {
      title: t("addVideosToNewPlaylist"),
      icon: <ListPlusIcon />,
      action: addToNewPlaylist,
    },
  ];
  const definedItems = items.filter((i): i is DropdownItemProps => !!i);

  const selectedItems: (DropdownItemProps | undefined)[] = [
    ...(selectedDropdownItems || []),
    {
      title: t("addSelectedToNewPlaylist"),
      icon: <ListPlusIcon />,
      action: addSelectedToNewPlaylist,
    },
  ];
  const definedSelectedItems = selectedItems.filter(
    (i): i is DropdownItemProps => !!i
  );
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreHorizontalIcon fontSize="large" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right">
          {definedItems.map((i) => (
            <DropdownItem key={i.title} {...i} />
          ))}
          <PlaylistSubMenu
            title={t("addToPlaylist")}
            playlists={playlists}
            videos={videoList}
          />
          {selected &&
            selected.size > 0 && [
              <DropdownMenuSeparator key="seperator" />,
              ...definedSelectedItems.map((i) => (
                <DropdownItem key={i.title} {...i} />
              )),
              <PlaylistSubMenu
                key="playlists"
                title={t("addSelectedToPlaylist")}
                playlists={playlists}
                videos={selectedVideos}
              />,
            ]}
        </DropdownMenuContent>
      </DropdownMenu>
      <AddPlaylistDialog
        videos={playlistDialogVideos}
        open={playlistDialogOpen}
        setOpen={setPlaylistDialogOpen}
      />
    </>
  );
};

export default PlaylistMenu;
