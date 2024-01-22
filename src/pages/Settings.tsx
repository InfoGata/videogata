import DisableAutoUpdateSetting from "@/components/Settings/DisableAutoUpdateSetting";
import UpdateCorsSetting from "@/components/Settings/UpdateCorsSetting";
import UseMiniPlayerSetting from "@/components/Settings/UseMiniPlayerSetting";
import React from "react";

const Settings: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <DisableAutoUpdateSetting />
      <UpdateCorsSetting />
      <UseMiniPlayerSetting />
    </div>
  );
};

export default Settings;
