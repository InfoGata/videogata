import { analyticsConfigured, doNotTrackEnabled } from "@/lib/analytics";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDisableAnalytics } from "@/store/reducers/settingsReducer";
import { Link } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const AnalyticsSetting: React.FC = () => {
  const dispatch = useAppDispatch();
  const disableAnalytics = useAppSelector(
    (state) => state.settings.disableAnalytics
  );
  const { t } = useTranslation("settings");

  // Nothing to offer a switch for in a build with no key.
  if (!analyticsConfigured) return null;

  const doNotTrack = doNotTrackEnabled();

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <Switch
          id="analytics"
          // Left interactive under Do Not Track so the choice is still
          // recorded, but shown off because nothing is being collected.
          checked={!disableAnalytics && !doNotTrack}
          onCheckedChange={(checked) =>
            dispatch(setDisableAnalytics(!checked))
          }
        />
        <Label htmlFor="analytics">{t("analytics")}</Label>
      </div>
      <p className="text-sm text-muted-foreground">
        {doNotTrack ? t("analyticsDoNotTrack") : t("analyticsDescription")}{" "}
        <Link to="/privacy" className="text-primary hover:underline">
          {t("analyticsPrivacyLink")}
        </Link>
      </p>
    </div>
  );
};

export default AnalyticsSetting;
