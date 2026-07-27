import { canonicalizePluginUrl, pluginIdParams } from "@/lib/plugin-route";
import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * `/s/youtube` is the natural thing to type or share, but a plugin has no feed
 * of its own to land on, so send it to the plugin's details page.
 */
export const Route = createFileRoute("/s/$pluginId/")({
  params: pluginIdParams(),
  beforeLoad: (ctx) => {
    canonicalizePluginUrl(ctx);

    throw redirect({
      to: "/plugins/$pluginId",
      params: { pluginId: ctx.params.pluginId },
      replace: true,
    });
  },
});
