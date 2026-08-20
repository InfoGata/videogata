import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import PluginCards from "../components/PluginCards/PluginCards";
import HomeFeed from "../components/HomeFeed";
import { ExtensionBanner } from "@/components/ExtensionBanner";

export const Index: React.FC = () => {
  // Install cards are a call to action for someone with nothing to watch, not
  // a permanent fixture under a working feed.
  const [hasFeed, setHasFeed] = React.useState<boolean | null>(null);

  const onFeedResolved = React.useCallback((hasVideos: boolean) => {
    setHasFeed(hasVideos);
  }, []);

  return (
    <div className="space-y-8">
      <ExtensionBanner />
      <HomeFeed onFeedResolved={onFeedResolved} />
      {hasFeed === false && <PluginCards />}
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: Index,
});
