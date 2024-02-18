import { DropdownItemProps } from "@/components/DropdownItem";
import HomeVideoCard from "@/components/HomeVideoCard";
import VideoContainer from "@/components/VideoContainer";
import { useLiveQuery } from "dexie-react-hooks";
import { FileUpIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import ImportDialog from "../components/ImportDialog";
import PlaylistMenu from "../components/PlaylistMenu";
import { db } from "../database";
import { Playlist, Video } from "../plugintypes";
import { useAppSelector } from "../store/hooks";

const FavoriteVideos: React.FC = () => {
  const videos = useLiveQuery(() => db.favoriteVideos.toArray());
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const { t } = useTranslation();
  const playlists = useAppSelector((state) => state.playlist.playlists);

  const openImportDialog = () => {
    setImportDialogOpen(true);
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
  };

  const onImport = async (item: Video[] | Playlist) => {
    if (Array.isArray(item)) {
      await db.favoriteVideos.bulkAdd(item);
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

  if (!videos) {
    return null;
  }

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
        videoList={videos ?? []}
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

export default FavoriteVideos;
