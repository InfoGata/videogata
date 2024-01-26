import useVideoMenu from "@/hooks/useVideoMenu";
import { cn } from "@/lib/utils";
import React from "react";
import { useQuery } from "react-query";
import usePlugins from "../hooks/usePlugins";
import HomeVideoCard from "./HomeVideoCard";
import SelectPlugin from "./SelectPlugin";

const TopItemCards: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();
  const { openMenu } = useVideoMenu();

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
    const openVideoMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      openMenu(event, v);
    };

    return <HomeVideoCard key={v.apiId} video={v} openMenu={openVideoMenu} />;
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
      <div className="grid grid-cols-4 gap-5">{videoCards}</div>
    </>
  );
};

export default TopItemCards;
