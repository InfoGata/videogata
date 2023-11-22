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
import {
  corsIsDisabled,
  getFileTypeFromPluginUrl,
  getPlugin,
  isLoggedIn,
} from "../utils";
import { Capacitor } from "@capacitor/core";
import { InAppBrowser } from "@awesome-cordova-plugins/in-app-browser";

const PluginDetails: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const [plugin, setPlugin] = React.useState<PluginInfo>();
  const [scriptSize, setScriptSize] = React.useState(0);
  const [optionSize, setOptionsSize] = React.useState(0);
  const [playerSize, setPlayerSize] = React.useState(0);
  const { updatePlugin } = usePlugins();
  const { t } = useTranslation(["plugins", "common"]);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const hasLogin = corsIsDisabled() && !!plugin?.manifest?.authentication;

  const iframeListener = React.useCallback(async (event: MessageEvent<any>) => {
    if (event.source !== window) {
      return;
    }

    if (event.data.type === "infogata-extension-notify-login") {
      setLoggedIn(true);
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener("message", iframeListener);
    return () => window.removeEventListener("message", iframeListener);
  }, [iframeListener]);

  React.useEffect(() => {
    const checkLogin = async () => {
      let hasLoggedIn = false;
      if (plugin?.manifest?.authentication) {
        hasLoggedIn = await isLoggedIn(plugin?.manifest?.authentication);
      }
      setLoggedIn(hasLoggedIn);
    };
    checkLogin();
  }, [plugin]);

  const loadPluginFromDb = React.useCallback(async () => {
    const p = await db.plugins.get(pluginId || "");
    setPlugin(p);
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
    if (plugin?.manifest?.authentication?.loginUrl) {
      if (Capacitor.isNativePlatform()) {
        const win = InAppBrowser.create(
          plugin.manifest.authentication.loginUrl,
          "_blank"
        );
        win.on("loadstop").subscribe(async () => {
          if (plugin.manifest?.authentication) {
            const hasLoggedIn = await isLoggedIn(
              plugin.manifest.authentication
            );
            if (hasLoggedIn) {
              win.close();
              setLoggedIn(true);
            }
          }
        });
      } else {
        if (window.InfoGata.openLoginWindow) {
          window.InfoGata.openLoginWindow(
            plugin.manifest.authentication,
            plugin.id || ""
          );
        }
      }
    }
  };

  React.useEffect(() => {
    loadPluginFromDb();
  }, [loadPluginFromDb]);

  const onUpdate = async () => {
    if (plugin?.manifestUrl) {
      const fileType = getFileTypeFromPluginUrl(plugin.manifestUrl);
      const newPlugin = await getPlugin(fileType);
      if (newPlugin && plugin.id) {
        newPlugin.id = plugin.id;
        newPlugin.manifestUrl = plugin.manifestUrl;
        await updatePlugin(newPlugin, plugin.id);
        await loadPluginFromDb();
      }
    }
  };

  return (
    <>
      {plugin ? (
        <div>
          <Typography variant="h3">
            {t("plugins:pluginDetailsTitle")}
          </Typography>
          <Typography variant="h6">{plugin.name}</Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t("plugins:pluginDescription")}
                secondary={plugin.description}
              />
            </ListItem>
            {plugin.homepage && (
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href={plugin.homepage}
                  target="_blank"
                >
                  <ListItemText
                    primary={t("plugins:homepage")}
                    secondary={plugin.homepage}
                  />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem>
              <ListItemText
                primary={t("plugins:version")}
                secondary={plugin.version}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Id" secondary={plugin.id} />
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
            {plugin.manifestUrl && (
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href={plugin.manifestUrl}
                  target="_blank"
                >
                  <ListItemText
                    primary={t("plugins:updateUrl")}
                    secondary={plugin.manifestUrl}
                  />
                </ListItemButton>
              </ListItem>
            )}
            {hasLogin && (
              <ListItem disablePadding>
                {loggedIn ? (
                  <ListItemText primary={t("plugins:isLoggedIn")} />
                ) : (
                  <ListItemButton onClick={onLogin}>
                    <ListItemText primary={t("plugins:login")} />
                  </ListItemButton>
                )}
              </ListItem>
            )}
          </List>
          {plugin.manifestUrl && (
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
