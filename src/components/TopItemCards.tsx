import { cn } from "@/lib/utils";
import React from "react";
import { useQuery } from "react-query";
import usePlugins from "../hooks/usePlugins";
import HomeVideoCard from "./HomeVideoCard";
import SelectPlugin from "./SelectPlugin";
import VideoCardSkeleton from "./VideoCardSkeleton";

const TopItemCards: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();

  const getTopItems = async () => {
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin) {
      const results = await plugin.remote.onGetTopItems();
      return results;
    }
  };

  const query = useQuery(["topitems", pluginId], getTopItems, {
    // Keep query for 5 minutes
    staleTime: 1000 * 60 * 5,
  });

  const videoCards = query.data?.videos?.items.map((v) => {
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
      <div className="grid grid-cols-4 gap-5 mt-4">
        {query.isLoading
          ? Array(8)
              .fill(true)
              .map((_, i) => <VideoCardSkeleton key={i} />)
          : videoCards}
      </div>
    </>
  );
};

export default TopItemCards;
