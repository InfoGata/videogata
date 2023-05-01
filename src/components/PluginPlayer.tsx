import React from "react";
import { PluginFrameContainer } from "../PluginsContext";
import { db } from "../database";
import { getPluginSubdomain } from "../utils";
import usePlugins from "../hooks/usePlugins";

interface PluginPlayerProps {
  apiId?: string;
  channelApiId?: string;
  isLive?: boolean;
  plugin?: PluginFrameContainer;
}

const PluginPlayer: React.FC<PluginPlayerProps> = (props) => {
  const { apiId, plugin, isLive, channelApiId } = props;
  const [playerHtml, setPlayerHtml] = React.useState<string>();
  const ref = React.useRef<HTMLIFrameElement>(null);
  const { pluginMessage } = usePlugins();

  React.useEffect(() => {
    const getPlayerHtml = async () => {
      const pluginData = await db.plugins.get(plugin?.id || "");
      setPlayerHtml(pluginData?.playerHtml);
    };
    getPlayerHtml();
  }, [plugin?.id]);

  const iframeListener = React.useCallback(
    async (event: MessageEvent<any>) => {
      if (ref.current?.contentWindow === event.source && plugin) {
        if (await plugin.hasDefined.onUiMessage()) {
          plugin.remote.onUiMessage(event.data);
        }
      }
    },
    [plugin]
  );

  React.useEffect(() => {
    window.addEventListener("message", iframeListener);
    return () => window.removeEventListener("message", iframeListener);
  }, [iframeListener]);

  React.useEffect(() => {
    if (pluginMessage?.pluginId === plugin?.id) {
      ref.current?.contentWindow?.postMessage(pluginMessage?.message, "*");
    }
  }, [pluginMessage, plugin?.id]);

  const iframeOnload = async () => {
    const pluginData = await db.plugins.get(plugin?.id || "");
    if (pluginData) {
      ref.current?.contentWindow?.postMessage(
        {
          type: "init",
          srcdoc: pluginData?.playerHtml,
        },
        "*"
      );
    }
  };

  const srcUrl = `${getPluginSubdomain(
    plugin?.id
  )}/ui.html?apiId=${apiId}&isLive=${
    isLive === true
  }&channelApiId=${channelApiId}`;

  return (
    <>
      {playerHtml && (
        <iframe
          ref={ref}
          name={plugin?.id}
          title={plugin?.name}
          sandbox="allow-scripts allow-same-origin  allow-popups allow-popups-to-escape-sandbox"
          src={srcUrl}
          onLoad={iframeOnload}
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
          allowFullScreen
          style={{ width: "100%", height: "75vh" }}
        />
      )}
    </>
  );
};

export default PluginPlayer;
