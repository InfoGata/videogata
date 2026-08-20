import { cn } from "@/lib/utils";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import usePlugins from "../hooks/usePlugins";
import { Video } from "../plugintypes";
import HomeVideoCard from "./HomeVideoCard";
import SelectPlugin from "./SelectPlugin";
import VideoCardSkeleton from "./VideoCardSkeleton";
import VideoContainer from "./VideoContainer";

const TopItemCards: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();

  const getHomeVideos = async (): Promise<Video[]> => {
    const plugin = plugins.find((p) => p.id === pluginId);
    if (!plugin) return [];

    // The signed-in user's own feed is what they'd see on the source site, so
    // prefer it and keep the plugin's top items as the fallback.
    if (await plugin.methodDefined("onGetUserFeed")) {
      try {
        const feed = await plugin.remote.onGetUserFeed({});
        if (feed?.items?.length) return feed.items;
      } catch {
        // Being signed out is the common case here, not an error worth
        // surfacing. Fall through to the top items.
      }
    }

    const topItems = await plugin.remote.onGetTopItems();
    return topItems?.videos?.items ?? [];
  };

  const query = useQuery({
    queryKey: ["topitems", pluginId],
    queryFn: getHomeVideos,
    // Keep query for 5 minutes
    staleTime: 1000 * 60 * 5,
    enabled: !!pluginId,
  });

  const videoCards = query.data?.map((v) => {
    return <HomeVideoCard key={v.apiId} video={v} />;
  });

  return (
    <>
      <div className={cn(pluginId ? "block" : "hidden")}>
        <SelectPlugin
          pluginId={pluginId}
          setPluginId={setPluginId}
          methodName="onGetTopItems"
        />
      </div>
      <VideoContainer>
        {query.isLoading
          ? Array(8)
              .fill(true)
              .map((_, i) => <VideoCardSkeleton key={i} />)
          : videoCards}
      </VideoContainer>
    </>
  );
};

export default TopItemCards;
