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
import { Playlist, PlaylistInfo, Video } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addPlaylist, deletePlaylist } from "../store/reducers/playlistReducer";
import { filterAsync } from "../utils";

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
  const onCloseImportDialog = () => setOpenImportDialog(false);

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

  const onDelete = (playlist: PlaylistInfo) => {
    dispatch(deletePlaylist(playlist));
  };

  const onImport = (item: Playlist | Video[]) => {
    if ("videos" in item) {
      dispatch(addPlaylist(item));
      enqueueSnackbar(t("playlistImported", { playlistName: item.name }));
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold">{t("playlists")}</h2>
      <Button variant="outline" onClick={onOpenImportDialog}>
        {t("importPlaylistByUrl")}
      </Button>
      <div>{pluginPlaylists}</div>
      <div>
        {playlists.map((p) => (
          <PlaylistListItem
            key={p.id}
            playlist={p}
            dropdownItems={[
              {
                icon: <Trash />,
                title: t("delete"),
                action: () => {
                  onDelete(p);
                },
              },
            ]}
          />
        ))}
      </div>
      <ImportDialog
        setOpen={setOpenImportDialog}
        open={openImportDialog}
        handleClose={onCloseImportDialog}
        parseType="playlist"
        onSuccess={onImport}
      />
    </>
  );
};

export default Playlists;
