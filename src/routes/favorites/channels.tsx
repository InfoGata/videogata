import { Link, createFileRoute } from "@tanstack/react-router";
import ChannelListItem from "@/components/ChannelListItem";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { PluginFrameContainer } from "@/PluginsContext";
import { db } from "@/database";
import usePlugins from "@/hooks/usePlugins";
import { filterAsync } from "@infogata/utils";
import { buttonVariants } from "@/components/ui/button";

const FavoriteChannels: React.FC = () => {
  const channels = useLiveQuery(() => db.favoriteChannels.toArray());
  const { t } = useTranslation();
  const { plugins } = usePlugins();
  const [channelPlugins, setChannelPlugins] = React.useState<
    PluginFrameContainer[]
  >([]);
  React.useEffect(() => {
    const setPlugins = async () => {
      const filteredPlugins = await filterAsync(
        plugins,
        async (p) => await p.hasDefined.onGetUserChannels()
      );
      setChannelPlugins(filteredPlugins);
    };
    setPlugins();
  }, [plugins]);

  if (!channels) {
    return null;
  }

  if (channels.length === 0) {
    return <h3>{t("noFavoriteChannels")}</h3>;
  }

  const channelCards = channels.map((c) => {
    return <ChannelListItem channel={c} key={c.id} />;
  });

  return (
    <div>
      <div>
        {channelPlugins.map((p) => (
          <Link
            className={buttonVariants({ variant: "outline" })}
            to="/plugins/$pluginId/channels"
            params={{ pluginId: p.id || "" }}
            key={p.id}
          >
            {p.name}
          </Link>
        ))}
      </div>
      <div>{channelCards}</div>
    </div>
  );
};

export const Route = createFileRoute("/favorites/channels")({
  component: FavoriteChannels,
});
