import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { PuzzleIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Shown when a url names a plugin that isn't installed here. Shared urls carry
 * an alias that only means something on a device that has the plugin, so name
 * what was asked for instead of a bare not found.
 */
const PluginNotInstalled: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation("plugins");

  // `/s/<alias>/...` and `/plugins/<alias>/...` both put it in the same place.
  const requested = pathname.split("/").filter(Boolean)[1];

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <PuzzleIcon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">
          {t("pluginNotInstalledTitle")}
        </h1>
        <p className="text-muted-foreground">
          {t("pluginNotInstalledDescription", { alias: requested })}
        </p>
      </div>
      <Link to="/plugins" className={cn(buttonVariants({ variant: "default" }))}>
        {t("browsePlugins")}
      </Link>
    </div>
  );
};

export default PluginNotInstalled;
