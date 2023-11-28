import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { db } from "../database";
import usePlugins from "../hooks/usePlugins";
import { PluginInfo } from "../plugintypes";
import { corsIsDisabled, getFileTypeFromPluginUrl, getPlugin } from "../utils";
import { Capacitor } from "@capacitor/core";
import { InAppBrowser } from "@awesome-cordova-plugins/in-app-browser";
import { NotifyLoginMessage } from "../types";
import { useLiveQuery } from "dexie-react-hooks";

const PluginDetails: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const [pluginInfo, setPluginInfo] = React.useState<PluginInfo>();
  const [scriptSize, setScriptSize] = React.useState(0);
  const [optionSize, setOptionsSize] = React.useState(0);
  const [playerSize, setPlayerSize] = React.useState(0);
  const { updatePlugin, plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { t } = useTranslation(["plugins", "common"]);
  const pluginAuth = useLiveQuery(() => db.pluginAuths.get(pluginId || ""));
  const hasLogin = corsIsDisabled() && !!pluginInfo?.manifest?.authentication;

  const iframeListener = React.useCallback(
    async (event: MessageEvent<NotifyLoginMessage>) => {
      if (event.source !== window) {
        return;
      }

      if (event.data.type === "infogata-extension-notify-login") {
        if (plugin && event.data.pluginId === plugin.id) {
          db.pluginAuths.put({
            pluginId: plugin.id || "",
            headers: event.data.headers,
          });
          if (await plugin.hasDefined.onPostLogin()) {
            await plugin.remote.onPostLogin();
          }
        }
      }
    },
    [plugin]
  );

  React.useEffect(() => {
    window.addEventListener("message", iframeListener);
    return () => window.removeEventListener("message", iframeListener);
  }, [iframeListener]);

  const loadPluginFromDb = React.useCallback(async () => {
    const p = await db.plugins.get(pluginId || "");
    setPluginInfo(p);
    const scriptBlob = new Blob([p?.script || ""]);
    setScriptSize(scriptBlob.size);
    if (p?.optionsHtml) {
      const optionsBlob = new Blob([p.optionsHtml]);
      setOptionsSize(optionsBlob.size);
    }
    if (p?.playerHtml) {
      const playerBlob = new Blob([p.playerHtml]);
      setPlayerSize(playerBlob.size);
    }
  }, [pluginId]);

  const onLogin = () => {
    if (pluginInfo?.manifest?.authentication?.loginUrl) {
      if (Capacitor.isNativePlatform()) {
        const win = InAppBrowser.create(
          pluginInfo.manifest.authentication.loginUrl,
          "_blank"
        );
        win.on("message").subscribe(async (params) => {
          const message = params.data.message;
          console.log(message);
        });
        const INJECTED_JAVASCRIPT = `(function() {
          var open = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function() {
              this.addEventListener("load", function() {
                  var message = {"status" : this.status, "response" : this.response}
                  webkit.messageHandlers.cordova_iab.postMessage(stringifiedMessageObj);"
              });
              open.apply(this, arguments);
          };})();`;
        win.executeScript({ code: INJECTED_JAVASCRIPT });
      } else {
        if (window.InfoGata.openLoginWindow) {
          window.InfoGata.openLoginWindow(
            pluginInfo.manifest.authentication,
            pluginInfo.id || ""
          );
        }
      }
    }
  };

  React.useEffect(() => {
    loadPluginFromDb();
  }, [loadPluginFromDb]);

  const onUpdate = async () => {
    if (pluginInfo?.manifestUrl) {
      const fileType = getFileTypeFromPluginUrl(pluginInfo.manifestUrl);
      const newPlugin = await getPlugin(fileType);
      if (newPlugin && pluginInfo.id) {
        newPlugin.id = pluginInfo.id;
        newPlugin.manifestUrl = pluginInfo.manifestUrl;
        await updatePlugin(newPlugin, pluginInfo.id);
        await loadPluginFromDb();
      }
    }
  };

  const onLogout = async () => {
    if (pluginId) {
      db.pluginAuths.delete(pluginId);
    }
  };

  return (
    <>
      {pluginInfo ? (
        <div>
          <Typography variant="h3">
            {t("plugins:pluginDetailsTitle")}
          </Typography>
          <Typography variant="h6">{pluginInfo.name}</Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t("plugins:pluginDescription")}
                secondary={pluginInfo.description}
              />
            </ListItem>
            {pluginInfo.homepage && (
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href={pluginInfo.homepage}
                  target="_blank"
                >
                  <ListItemText
                    primary={t("plugins:homepage")}
                    secondary={pluginInfo.homepage}
                  />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem>
              <ListItemText
                primary={t("plugins:version")}
                secondary={pluginInfo.version}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Id" secondary={pluginInfo.id} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t("plugins:scriptSize")}
                secondary={`${scriptSize / 1000} kb`}
              />
            </ListItem>
            {!!optionSize && (
              <ListItem>
                <ListItemText
                  primary={t("plugins:optionsPageSize")}
                  secondary={`${optionSize / 1000} kb`}
                />
              </ListItem>
            )}
            {!!playerSize && (
              <ListItem>
                <ListItemText
                  primary={t("plugins:playerPageSize")}
                  secondary={`${playerSize / 1000} kb`}
                />
              </ListItem>
            )}
            {pluginInfo.manifestUrl && (
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href={pluginInfo.manifestUrl}
                  target="_blank"
                >
                  <ListItemText
                    primary={t("plugins:updateUrl")}
                    secondary={pluginInfo.manifestUrl}
                  />
                </ListItemButton>
              </ListItem>
            )}
            {hasLogin && (
              <ListItem disablePadding>
                {pluginAuth ? (
                  <ListItemButton onClick={onLogout}>
                    <ListItemText primary={t("plugins:logout")} />
                  </ListItemButton>
                ) : (
                  <ListItemButton onClick={onLogin}>
                    <ListItemText primary={t("plugins:login")} />
                  </ListItemButton>
                )}
              </ListItem>
            )}
          </List>
          {pluginInfo.manifestUrl && (
            <Button onClick={onUpdate}>{t("plugins:updatePlugin")}</Button>
          )}
        </div>
      ) : (
        <>{t("common:notFound")}</>
      )}
    </>
  );
};

export default PluginDetails;
