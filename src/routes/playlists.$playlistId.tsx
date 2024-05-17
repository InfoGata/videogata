import { createFileRoute } from "@tanstack/react-router";
import { DropdownItemProps } from "@/components/DropdownItem";
import { Button } from "@/components/ui/button";
import { ItemMenuType } from "@/types";
import { useLiveQuery } from "dexie-react-hooks";
import { FileUpIcon, PencilIcon, Trash, TrashIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import EditPlaylistDialog from "../components/EditPlaylistDialog";
import ImportDialog from "../components/ImportDialog";
import PlaylistMenu from "../components/PlaylistMenu";
import SelectVideoListPlugin from "../components/SelectVideoListPlugin";
import Spinner from "../components/Spinner";
import VideoList from "../components/VideoList";
import { db } from "../database";
import useSelected from "../hooks/useSelected";
import { Playlist, Video } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addPlaylistVideos,
  setPlaylistVideos,
} from "../store/reducers/playlistReducer";
import { createSelector } from "@reduxjs/toolkit";
import { AppState } from "@/store/store";

const PlaylistVideos: React.FC = () => {
  const { playlistId } = Route.useParams();

  const playlistInfo = useAppSelector((state) =>
    state.playlist.playlists.find((p) => p.id === playlistId)
  );
  const playlistsSelector = createSelector(
    [(state: AppState) => state.playlist.playlists],
    (playlists) => playlists.filter((p) => p.id !== playlistId)
  );
  const playlists = useAppSelector(playlistsSelector);

  const [openEditMenu, setOpenEditMenu] = React.useState(false);
  const playlist = useLiveQuery(
    () => db.playlists.get(playlistId || ""),
    [playlistId],
    false
  );
  const videos = (playlist && playlist?.videos) || [];
  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(videos || []);

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  const clearSelectedItems = async () => {
    if (playlist) {
      const newVideoList = videos.filter((t) => !selected.has(t.id ?? ""));
      dispatch(setPlaylistVideos(playlist, newVideoList));
    }
  };

  const onDragOver = (newVideoList: Video[]) => {
    if (playlist) {
      dispatch(setPlaylistVideos(playlist, newVideoList));
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
      dispatch(addPlaylistVideos(playlist, item));
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
      dispatch(setPlaylistVideos(playlist, newVideolist));
    }
  };

  const videoMenuItems: DropdownItemProps[] = [
    { title: t("delete"), icon: <Trash />, action: onDelete },
  ];

  return (
    <>
      <Spinner open={playlist === false} />
      {playlist ? (
        <>
          <div className="flex">
            <h3 className="text-4xl font-bold">{playlistInfo?.name}</h3>
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
        <>{playlist !== false && <h3>{t("notFound")}</h3>}</>
      )}
    </>
  );
};

export const Route = createFileRoute("/playlists/$playlistId")({
  component: PlaylistVideos,
});
