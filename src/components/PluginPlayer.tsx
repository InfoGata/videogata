import React from "react";
import { PluginFrameContainer, usePlugins } from "../PluginsContext";
import { db } from "../database";

interface PluginPlayerProps {
  apiId?: string;
  plugin?: PluginFrameContainer;
}

const PluginPlayer: React.FC<PluginPlayerProps> = (props) => {
  const { apiId, plugin } = props;
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

  let srcUrl = `${window.location.protocol}//${plugin?.id}.${window.location.host}/ui.html?apiId=${apiId}`;
  // if (process.env.NODE_ENV === "production") {
  //   srcUrl = `https://${plugin.id}.audiogata.com/ui.html`;
  // }

  return (
    <>
      {playerHtml && (
        <iframe
          ref={ref}
          name={plugin?.id}
          title={plugin?.name}
          sandbox="allow-scripts allow-same-origin"
          src={srcUrl}
          onLoad={iframeOnload}
          allow="autoplay; fullscreen; picture-in-picture"
          width="800"
          height="800"
          frameBorder="0"
          allowFullScreen
        />
      )}
    </>
  );
};

export default PluginPlayer;