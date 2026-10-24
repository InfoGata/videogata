import { createFileRoute } from "@tanstack/react-router";
import { DropdownItemProps } from "@/components/DropdownItem";
import HomeVideoCard from "@/components/HomeVideoCard";
import VideoContainer from "@/components/VideoContainer";
import { FileUpIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import ImportDialog from "@/components/ImportDialog";
import PlaylistMenu from "@/components/PlaylistMenu";
import { Playlist, Video } from "@/plugintypes";
import { addFavorites } from "@/sync/library";
import { useFavorites, usePlaylists } from "@/sync/useLibrary";

const FavoriteVideos: React.FC = () => {
  const videos = useFavorites("videos");
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const { t } = useTranslation();
  const playlists = usePlaylists();

  const openImportDialog = () => {
    setImportDialogOpen(true);
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
  };

  const onImport = async (item: Video[] | Playlist) => {
    if (Array.isArray(item)) {
      await addFavorites("videos", item);
      closeImportDialog();
    }
  };

  const dropdownItems: DropdownItemProps[] = [
    {
      title: t("importVideoByUrl"),
      icon: <FileUpIcon />,
      action: openImportDialog,
    },
  ];

  if (videos.length === 0) {
    return <h3>{t("noFavoriteVideos")}</h3>;
  }

  const videoCards = videos.map((v) => {
    return <HomeVideoCard key={v.apiId} video={v} />;
  });

  return (
    <div>
      <PlaylistMenu
        playlists={playlists}
        videoList={videos}
        dropdownItems={dropdownItems}
      />
      <VideoContainer>{videoCards}</VideoContainer>
      <ImportDialog
        setOpen={setImportDialogOpen}
        open={importDialogOpen}
        parseType="video"
        onSuccess={onImport}
      />
    </div>
  );
};

export const Route = createFileRoute("/favorites/videos")({
  component: FavoriteVideos,
});
