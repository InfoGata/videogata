import { createFileRoute } from "@tanstack/react-router";
import { DropdownItemProps } from "@/components/DropdownItem";
import { Button } from "@/components/ui/button";
import { ItemMenuType } from "@/types";
import { FileUpIcon, PencilIcon, Trash, TrashIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import EditPlaylistDialog from "../components/EditPlaylistDialog";
import ImportDialog from "../components/ImportDialog";
import PlaylistMenu from "../components/PlaylistMenu";
import SelectVideoListPlugin from "../components/SelectVideoListPlugin";
import VideoList from "../components/VideoList";
import useSelected from "../hooks/useSelected";
import { Playlist, Video } from "../plugintypes";
import { addPlaylistVideos, setPlaylistVideos } from "../sync/library";
import { usePlaylist, usePlaylists } from "../sync/useLibrary";

const PlaylistVideos: React.FC = () => {
  const { playlistId } = Route.useParams();

  const allPlaylists = usePlaylists();
  const playlists = React.useMemo(
    () => allPlaylists.filter((p) => p.id !== playlistId),
    [allPlaylists, playlistId]
  );

  const [openEditMenu, setOpenEditMenu] = React.useState(false);
  const playlist = usePlaylist(playlistId);
  const videos = React.useMemo(() => playlist?.videos ?? [], [playlist]);
  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(videos);

  const { t } = useTranslation();

  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  const clearSelectedItems = async () => {
    if (playlist) {
      const newVideoList = videos.filter((t) => !selected.has(t.id ?? ""));
      setPlaylistVideos(playlist, newVideoList);
    }
  };

  const onDragOver = (newVideoList: Video[]) => {
    if (playlist) {
      setPlaylistVideos(playlist, newVideoList);
    }
  };

  const onEditMenuOpen = () => {
    setOpenEditMenu(true);
  };

  const openImportDialog = () => {
    setImportDialogOpen(true);
  };

  const onImport = (item: Video[] | Playlist) => {
    if (playlist && Array.isArray(item)) {
      addPlaylistVideos(playlist, item);
      setImportDialogOpen(false);
    }
  };

  const dropdownItems: DropdownItemProps[] = [
    {
      title: t("importVideoByUrl"),
      icon: <FileUpIcon />,
      action: openImportDialog,
    },
  ];

  const selectedDropdownItems: DropdownItemProps[] = [
    {
      title: t("deleteSelectedVideos"),
      icon: <TrashIcon />,
      action: clearSelectedItems,
    },
  ];

  const onDelete = (item?: ItemMenuType) => {
    if (playlist && item?.type === "video") {
      const newVideolist = videos.filter((t) => t.id !== item.item.id);
      setPlaylistVideos(playlist, newVideolist);
    }
  };

  const videoMenuItems: DropdownItemProps[] = [
    { title: t("delete"), icon: <Trash />, action: onDelete },
  ];

  return (
    <>
      {playlist ? (
        <>
          <div className="flex">
            <h3 className="text-4xl font-bold">{playlist.name}</h3>
            <Button variant="ghost" size="icon" onClick={onEditMenuOpen}>
              <PencilIcon />
            </Button>
          </div>
          <PlaylistMenu
            videoList={videos}
            selected={selected}
            playlists={playlists}
            dropdownItems={dropdownItems}
            selectedDropdownItems={selectedDropdownItems}
          />
          <SelectVideoListPlugin videoList={videos} setSelected={setSelected} />
          <VideoList
            videos={videos}
            playlistId={playlistId}
            onDragOver={onDragOver}
            onSelect={onSelect}
            isSelected={isSelected}
            onSelectAll={onSelectAll}
            selected={selected}
            menuItems={videoMenuItems}
          />
          <EditPlaylistDialog
            setOpen={setOpenEditMenu}
            open={openEditMenu}
            playlist={playlist}
          />
          <ImportDialog
            setOpen={setImportDialogOpen}
            open={importDialogOpen}
            parseType="video"
            onSuccess={onImport}
          />
        </>
      ) : (
        <h3>{t("notFound")}</h3>
      )}
    </>
  );
};

export const Route = createFileRoute("/playlists/$playlistId")({
  component: PlaylistVideos,
});
