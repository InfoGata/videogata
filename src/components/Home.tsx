import React from "react";
import PluginCards from "./PluginCards/PluginCards";
import HomeFeed from "./HomeFeed";
import { ExtensionBanner } from "./ExtensionBanner";

// Lives outside src/routes so the route file exports only `Route` and
// autoCodeSplitting can move it into its own chunk.
export const Home: React.FC = () => {
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
