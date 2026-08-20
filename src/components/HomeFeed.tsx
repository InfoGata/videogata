import { cn } from "@/lib/utils";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import usePlugins from "../hooks/usePlugins";
import { Video } from "../plugintypes";
import { Button } from "./ui/button";
import HomeVideoCard from "./HomeVideoCard";
import SelectPlugin from "./SelectPlugin";
import VideoCardSkeleton from "./VideoCardSkeleton";
import VideoContainer from "./VideoContainer";

/**
 * Which list the videos came from. The page says so out loud: once a plugin can
 * return a personalized feed, "here are some videos" is ambiguous in a way that
 * matters — a signed-out session silently falling back to trending used to be
 * indistinguishable from a working feed.
 */
type FeedSource = "userFeed" | "topItems";

interface FeedResult {
  source: FeedSource;
  videos: Video[];
}

interface Props {
  /** Lets the page offer plugin install cards when nothing is on offer yet. */
  onFeedResolved?: (hasVideos: boolean) => void;
}

const HomeFeed: React.FC<Props> = ({ onFeedResolved }) => {
  const [pluginId, setPluginId] = React.useState("");
  const { plugins, pluginsLoaded } = usePlugins();
  const { t } = useTranslation();

  const plugin = plugins.find((p) => p.id === pluginId);
  const pluginName = plugin?.name ?? "";

  const getHomeVideos = async (): Promise<FeedResult> => {
    if (!plugin) return { source: "topItems", videos: [] };

    // The signed-in user's own feed is what they'd see on the source site, so
    // prefer it and keep the plugin's top items as the fallback.
    if (await plugin.methodDefined("onGetUserFeed")) {
      try {
        const feed = await plugin.remote.onGetUserFeed({});
        if (feed?.items?.length) {
          return { source: "userFeed", videos: feed.items };
        }
      } catch {
        // Being signed out is the common case here, not an error worth
        // surfacing. Fall through to the top items.
      }
    }

    const topItems = await plugin.remote.onGetTopItems();
    return { source: "topItems", videos: topItems?.videos?.items ?? [] };
  };

  const query = useQuery({
    queryKey: ["homeVideos", pluginId],
    queryFn: getHomeVideos,
    // Keep query for 5 minutes
    staleTime: 1000 * 60 * 5,
    enabled: !!pluginId,
  });

  // A plugin that can't be picked at all is its own kind of empty, distinct
  // from one that answered with nothing.
  const noPlugin = pluginsLoaded && !pluginId;
  const videos = query.data?.videos ?? [];
  const isUserFeed = query.data?.source === "userFeed";

  const { isSuccess } = query;
  React.useEffect(() => {
    if (noPlugin) onFeedResolved?.(false);
    else if (isSuccess) onFeedResolved?.(videos.length > 0);
  }, [noPlugin, isSuccess, videos.length, onFeedResolved]);

  const heading = isUserFeed ? t("yourFeed") : t("topItems");
  const description = isUserFeed
    ? t("yourFeedDescription", { pluginName })
    : t("topItemsDescription", { pluginName });

  const renderBody = () => {
    if (noPlugin) {
      return (
        <EmptyState
          title={t("homeFeedNoPlugins")}
          description={t("homeFeedNoPluginsDescription")}
        />
      );
    }

    if (query.isLoading || !pluginId) {
      return (
        <VideoContainer>
          {Array(8)
            .fill(true)
            .map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
        </VideoContainer>
      );
    }

    if (query.isError) {
      return (
        <EmptyState
          title={t("homeFeedError")}
          description={t("homeFeedErrorDescription", { pluginName })}
          action={
            <Button variant="outline" size="sm" onClick={() => query.refetch()}>
              {t("retry")}
            </Button>
          }
        />
      );
    }

    if (videos.length === 0) {
      return (
        <EmptyState
          title={t("homeFeedEmpty")}
          description={t("homeFeedEmptyDescription", { pluginName })}
        />
      );
    }

    return (
      <VideoContainer>
        {videos.map((v) => (
          <HomeVideoCard key={v.apiId} video={v} />
        ))}
      </VideoContainer>
    );
  };

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {/* h2, not h1: the top bar brand already owns the page's h1. */}
          <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
          {!!pluginName && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {/*
          Kept mounted but hidden until a plugin is chosen: this control is what
          chooses it, and an empty picker is noise on a page with nothing in it.
        */}
        <div className={cn(pluginId ? "block" : "hidden")}>
          <SelectPlugin
            pluginId={pluginId}
            setPluginId={setPluginId}
            methodName="onGetTopItems"
            compact
          />
        </div>
      </div>
      {renderBody()}
    </section>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
}) => (
  <div className="mt-6 rounded-xl border border-dashed px-6 py-12 text-center">
    <p className="font-medium">{title}</p>
    <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
      {description}
    </p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default HomeFeed;
