import { createFileRoute } from "@tanstack/react-router";
import DisableAutoUpdateSetting from "@/components/Settings/DisableAutoUpdateSetting";
import ThemeChangeSetting from "@/components/Settings/ThemeChangeSetting";
import UpdateCorsSetting from "@/components/Settings/UpdateCorsSetting";
import UseMiniPlayerSetting from "@/components/Settings/UseMiniPlayerSetting";
import React from "react";

const Settings: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <DisableAutoUpdateSetting />
      <UpdateCorsSetting />
      <UseMiniPlayerSetting />
      <ThemeChangeSetting />
    </div>
  );
};

export const Route = createFileRoute("/settings")({
  component: Settings,
});
