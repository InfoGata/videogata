import PlaylistListItem from "@/components/PlaylistListItem";
import { Button, buttonVariants } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PluginFrameContainer } from "../PluginsContext";
import ImportDialog from "../components/ImportDialog";
import usePlugins from "../hooks/usePlugins";
import { Playlist, Video } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addPlaylist, deletePlaylist } from "../store/reducers/playlistReducer";
import { filterAsync } from "../utils";
import { ItemMenuType } from "@/types";

const Playlists: React.FC = () => {
  const { plugins } = usePlugins();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [playlistPlugins, setPlaylistPlugins] = React.useState<
    PluginFrameContainer[]
  >([]);
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const { t } = useTranslation();
  const [openImportDialog, setOpenImportDialog] = React.useState(false);
  const onOpenImportDialog = () => setOpenImportDialog(true);

  const pluginPlaylists = playlistPlugins.map((p) => (
    <Link
      className={buttonVariants({ variant: "outline" })}
      to={`/plugins/${p.id}/playlists?isuserplaylist`}
      key={p.id}
    >
      {p.name}
    </Link>
  ));

  React.useEffect(() => {
    const setPlugins = async () => {
      const filteredPlugins = await filterAsync(
        plugins,
        async (p) =>
          (await p.hasDefined.onGetUserPlaylists()) &&
          (await p.hasDefined.onGetPlaylistVideos())
      );
      setPlaylistPlugins(filteredPlugins);
    };
    setPlugins();
  }, [plugins]);

  const onDelete = (item?: ItemMenuType) => {
    if (item?.type === "playlist") {
      dispatch(deletePlaylist(item.item));
    }
  };

  const onImport = (item: Playlist | Video[]) => {
    if ("videos" in item) {
      dispatch(addPlaylist(item));
      enqueueSnackbar(t("playlistImported", { playlistName: item.name }));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">{t("playlists")}</h2>
        <div>{pluginPlaylists}</div>
        <div>
          <Button variant="outline" onClick={onOpenImportDialog}>
            {t("importPlaylistByUrl")}
          </Button>
        </div>
      </div>
      <div>
        {playlists.map((p) => (
          <PlaylistListItem
            key={p.id}
            playlist={p}
            noFavorite={true}
            dropdownItems={[
              {
                icon: <Trash />,
                title: t("delete"),
                action: onDelete,
              },
            ]}
          />
        ))}
      </div>
      <ImportDialog
        setOpen={setOpenImportDialog}
        open={openImportDialog}
        parseType="playlist"
        onSuccess={onImport}
      />
    </>
  );
};

export default Playlists;
