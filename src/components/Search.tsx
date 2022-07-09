import { List } from "@mui/material";
import React from "react";
import { useLocation } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { Video } from "../plugintypes";
import SelectPlugin from "./SelectPlugin";
import VideoSearchResult from "./VideoSearchResult";

const Search: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const [videos, setVideos] = React.useState<Video[]>([]);
  const { plugins } = usePlugins();
  const location = useLocation();

  React.useEffect(() => {
    const onSearch = async (search: string) => {
      const plugin = plugins.find((p) => p.id === pluginId);
      if (plugin && (await plugin.hasDefined.onSearchAll())) {
        const searchAll = await plugin.remote.onSearchAll({ query: search });
        setVideos(searchAll.videos?.items ?? []);
      }
    };

    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    if (query) {
      onSearch(query);
    }
  }, [location.search, pluginId, plugins]);

  const videoList = videos.map((v) => (
    <VideoSearchResult key={v.apiId} video={v} />
  ));

  return (
    <>
      <SelectPlugin
        pluginId={pluginId}
        setPluginId={setPluginId}
        methodName="onSearchAll"
      />
      <List>{videoList}</List>
    </>
  );
};

export default Search;
