import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import ChannelSearchResults from "../components/ChannelSearchResults";
import PlaylistSearchResults from "../components/PlaylistSearchResults";
import SelectPlugin from "../components/SelectPlugin";
import Spinner from "../components/Spinner";
import VideoSearchResults from "../components/VideoSearchResults";
import usePlugins from "../hooks/usePlugins";
import { Channel, PlaylistInfo, SearchAllResult, Video } from "../plugintypes";
import { SearchResultType } from "../types";
import { z } from "zod";

const Search: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const [tabValue, setTabValue] = React.useState("videos");
  const { plugins } = usePlugins();
  const { t } = useTranslation();
  const { q } = Route.useSearch();
  const queryClient = useQueryClient();

  const onSearch = async () => {
    let searchAll: SearchAllResult | undefined;
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin && (await plugin.hasDefined.onSearchAll())) {
      searchAll = await plugin.remote.onSearchAll({ query: q });
    }

    if (searchAll?.videos) {
      setTabValue(SearchResultType.Videos);
    } else if (searchAll?.playlists) {
      setTabValue(SearchResultType.Playlists);
    } else if (searchAll?.channels) {
      setTabValue(SearchResultType.Channels);
    }

    queryClient.setQueryData<Video[] | undefined>(
      ["searchVideos", pluginId, q, undefined, undefined],
      searchAll?.videos?.items
    );
    queryClient.setQueryData<Channel[] | undefined>(
      ["searchChannels", pluginId, q, undefined, undefined],
      searchAll?.channels?.items
    );
    queryClient.setQueryData<PlaylistInfo[] | undefined>(
      ["searchPlaylists", pluginId, q, undefined, undefined],
      searchAll?.playlists?.items
    );

    return searchAll;
  };

  const query = useQuery(["search", pluginId, q], onSearch);
  const videoList = query?.data?.videos?.items || [];
  const channelList = query?.data?.channels?.items || [];
  const playlistList = query?.data?.playlists?.items || [];

  const handleChange = (newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Spinner open={query.isLoading} />
      <SelectPlugin
        pluginId={pluginId}
        setPluginId={setPluginId}
        methodName="onSearchAll"
      />
      <Tabs value={tabValue} onValueChange={handleChange}>
        <TabsList className="flex w-full justify-around">
          {videoList.length > 0 ? (
            <TabsTrigger value={SearchResultType.Videos} className="flex-1">
              {t("videos")}
            </TabsTrigger>
          ) : null}
          {channelList.length > 0 ? (
            <TabsTrigger value={SearchResultType.Channels} className="flex-1">
              {t("channels")}
            </TabsTrigger>
          ) : null}
          {playlistList.length > 0 ? (
            <TabsTrigger value={SearchResultType.Playlists} className="flex-1">
              {t("playlists")}
            </TabsTrigger>
          ) : null}
        </TabsList>
        <TabsContent value={SearchResultType.Videos}>
          {!!query.data?.videos && (
            <VideoSearchResults
              pluginId={pluginId}
              searchQuery={q}
              initialPage={query.data?.videos?.pageInfo}
              initialFilter={query.data?.videos?.filterInfo}
            />
          )}
        </TabsContent>
        <TabsContent value={SearchResultType.Channels}>
          {!!query.data?.channels && (
            <ChannelSearchResults
              pluginId={pluginId}
              searchQuery={q}
              initialPage={query.data?.channels?.pageInfo}
              initialFilter={query.data?.channels?.filterInfo}
            />
          )}
        </TabsContent>
        <TabsContent value={SearchResultType.Playlists}>
          {!!query.data?.playlists && (
            <PlaylistSearchResults
              pluginId={pluginId}
              searchQuery={q}
              initialPage={query.data?.playlists?.pageInfo}
              initialFilter={query.data?.playlists?.filterInfo}
            />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

const searchSchema = z.object({
  q: z.string().catch(""),
});

export const Route = createFileRoute("/search")({
  component: Search,
  validateSearch: searchSchema,
});
