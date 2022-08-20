import { Backdrop, CircularProgress, Menu } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useLocation, useParams } from "react-router-dom";
import useVideoMenu from "../hooks/useVideoMenu";
import { usePlugins } from "../PluginsContext";
import { Channel } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import PlaylistInfoCard from "./PlaylistInfoCard";
import PlaylistMenuItem from "./PlaylistMenuItem";
import VideoList from "./VideoList";

const ChannelPage: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const location = useLocation();
  const state = location.state as Channel | null;
  const [channel, setChannel] = React.useState<Channel | null>(state);
  const { closeMenu, openMenu, anchorEl, menuVideo } = useVideoMenu();
  const playlists = useAppSelector((state) => state.playlist.playlists);

  const getChannelVideos = async () => {
    if (plugin && (await plugin.hasDefined.onGetChannelVideos())) {
      const channelInfo = await plugin.remote.onGetChannelVideos({
        apiId: apiId,
      });

      if (channelInfo.channel) {
        setChannel(channelInfo.channel);
      }
      return channelInfo.items;
    }
    return [];
  };

  const query = useQuery(
    ["pluginplaylist", pluginId, apiId],
    getChannelVideos,
    {
      enabled: pluginsLoaded,
    }
  );

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {channel && (
        <PlaylistInfoCard name={channel.name || ""} images={channel.images} />
      )}
      <VideoList
        videos={query?.data || []}
        dragDisabled={true}
        openMenu={openMenu}
      />
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            videos={menuVideo ? [menuVideo] : []}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
    </>
  );
};

export default ChannelPage;
