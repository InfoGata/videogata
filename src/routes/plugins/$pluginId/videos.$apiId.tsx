import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "react-query";
import ConfirmPluginDialog from "@/components/ConfirmPluginDialog";
import PluginVideoComments from "@/components/PluginVideoComments";
import PluginVideoInfo from "@/components/PluginVideoInfo";
import PluginVideoPlaylist from "@/components/PluginVideoPlaylist";
import RecommendedVideos from "@/components/RecommendVideos";
import Spinner from "@/components/Spinner";
import { db } from "@/database";
import useFindPlugin from "@/hooks/useFindPlugin";
import usePlugins from "@/hooks/usePlugins";
import { Video } from "@/plugintypes";
import { useAppDispatch } from "@/store/hooks";
import { setPlayerInfo } from "@/store/reducers/playerReducer";
import { z } from "zod";

const PluginVideo: React.FC = () => {
  const { pluginId, apiId } = Route.useParams();
  const dispatch = useAppDispatch();
  const { videoId, playlistId } = Route.useSearch();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const [playlistVideos, setPlaylistVideos] = React.useState<Video[]>();
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  React.useEffect(() => {
    dispatch(setPlayerInfo({ apiId, pluginId }));
  }, [dispatch, apiId, pluginId]);

  const getVideo = async () => {
    if (pluginsLoaded && plugin && apiId) {
      if (await plugin.hasDefined.onGetVideo()) {
        const video = await plugin.remote.onGetVideo({ apiId });
        return video;
      }
    }
  };

  const query = useQuery(["pluginVideo", pluginId, apiId], getVideo, {
    enabled: pluginsLoaded,
  });

  React.useEffect(() => {
    const getPlaylistVideos = async () => {
      if (playlistId) {
        const playlist = await db.playlists.get(playlistId);
        setPlaylistVideos(playlist?.videos);
      } else {
        setPlaylistVideos(undefined);
      }
    };
    getPlaylistVideos();
  }, [playlistId]);

  return (
    <>
      {query.data && (
        <Helmet>
          <title>{query.data.title}</title>
        </Helmet>
      )}
      <Spinner open={isLoading} />
      {query.data && <PluginVideoInfo video={query.data} />}
      {playlistVideos && (
        <PluginVideoPlaylist
          videos={playlistVideos}
          playlistId={playlistId || ""}
          videoId={videoId}
        />
      )}
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8">
          <PluginVideoComments
            apiId={apiId || ""}
            pluginId={query.data?.pluginId || ""}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <RecommendedVideos
            pluginId={query.data?.pluginId || ""}
            videos={query.data?.recommendedVideos || []}
          />
        </div>
      </div>
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </>
  );
};

const pluginVideoSchema = z.object({
  playlistId: z.string().optional().catch(undefined),
  videoId: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/plugins/$pluginId/videos/$apiId")({
  component: PluginVideo,
  validateSearch: pluginVideoSchema,
});
