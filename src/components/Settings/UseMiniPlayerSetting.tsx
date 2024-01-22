import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closePlayer } from "@/store/reducers/playerReducer";
import { toggleUseMiniPlayer } from "@/store/reducers/settingsReducer";
import React from "react";
import { useTranslation } from "react-i18next";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const UseMiniPlayerSetting: React.FC = () => {
  const dispatch = useAppDispatch();
  const useMiniPlayer = useAppSelector((state) => state.settings.useMiniPlayer);
  const onToggleUseMiniPlayer = () => {
    dispatch(closePlayer());
    dispatch(toggleUseMiniPlayer());
  };
  const { t } = useTranslation("settings");
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="auto-update"
        checked={useMiniPlayer}
        onChange={onToggleUseMiniPlayer}
      />
      <Label htmlFor="auto-update">{t("disableAutoUpdatePlugins")}</Label>
    </div>
  );
};

export default UseMiniPlayerSetting;
