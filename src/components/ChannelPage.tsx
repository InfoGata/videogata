import { Backdrop, Button, CircularProgress, Grid } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import useFindPlugin from "../hooks/useFindPlugin";
import usePagination from "../hooks/usePagination";
import useVideoMenu from "../hooks/useVideoMenu";
import { usePlugins } from "../PluginsContext";
import { Channel, PageInfo } from "../plugintypes";
import ConfirmPluginDialog from "./ConfirmPluginDialog";
import PlaylistInfoCard from "./PlaylistInfoCard";
import VideoCards from "./VideoCards";

const ChannelPage: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const location = useLocation();
  const state = location.state as Channel | null;
  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);
  const [channel, setChannel] = React.useState<Channel | null>(state);
  const { openMenu } = useVideoMenu();
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const getChannelVideos = async () => {
    if (plugin && (await plugin.hasDefined.onGetChannelVideos())) {
      const channelInfo = await plugin.remote.onGetChannelVideos({
        apiId: apiId,
        pageInfo: page,
      });

      if (channelInfo.channel) {
        setChannel(channelInfo.channel);
      }
      setCurrentPage(channelInfo.pageInfo);
      return channelInfo.items;
    }
    return [];
  };

  const query = useQuery(
    ["pluginplaylist", pluginId, apiId, page],
    getChannelVideos,
    {
      enabled: pluginsLoaded && !!plugin,
    }
  );

  return (
    <>
      <Backdrop open={query.isLoading || isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {channel && (
        <PlaylistInfoCard name={channel.name || ""} images={channel.images} />
      )}
      <VideoCards videos={query?.data || []} openMenu={openMenu} />
      <Grid>
        {hasPreviousPage && <Button onClick={onPreviousPage}>Previous</Button>}
        {hasNextPage && <Button onClick={onNextPage}>Next</Button>}
      </Grid>
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </>
  );
};

export default ChannelPage;
