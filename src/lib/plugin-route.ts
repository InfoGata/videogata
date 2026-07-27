import PluginNotInstalled from "@/components/Plugins/PluginNotInstalled";
import { aliasForId, resolvePluginParam } from "@/lib/plugin-alias";
import { redirect } from "@tanstack/react-router";

/**
 * Shared route options for every route under `/s/$pluginId` and
 * `/plugins/$pluginId`. They translate between the alias in the url and the
 * plugin id the app uses everywhere else, so route bodies and every `<Link
 * params={{ pluginId }}>` keep dealing in ids only.
 */

/**
 * `TExtra` names the route's other path params so they survive the round trip
 * with their types intact, e.g. `pluginIdParams<{ apiId: string }>()`.
 */
export const pluginIdParams = <
  TExtra extends Record<string, string> = Record<never, string>,
>() => ({
  parse: (raw: TExtra & { pluginId: string }) => ({
    ...raw,
    pluginId: resolvePluginParam(raw.pluginId),
  }),
  stringify: (params: TExtra & { pluginId: string }) => ({
    ...params,
    pluginId: aliasForId(params.pluginId),
  }),
});

type PluginBeforeLoadContext = {
  params: { pluginId: string };
  location: { pathname: string; search: Record<string, unknown> };
};

/**
 * Rewrites a url that named the plugin some other way (its id, or an alias that
 * deduped differently on the device that shared it) to the canonical alias, so
 * whatever the user copies out of the address bar is the readable form.
 *
 * Reads the alias registry rather than router context: an unknown segment never
 * resolved to an id, so `aliasForId` hands it back unchanged and nothing is
 * rewritten.
 */
export const canonicalizePluginUrl = ({
  params,
  location,
}: PluginBeforeLoadContext) => {
  const alias = aliasForId(params.pluginId);

  // "/s/youtube/videos/x" and "/plugins/youtube/options" both hold it at index 2.
  const segments = location.pathname.split("/");
  if (segments[2] === alias) return;

  segments[2] = alias;
  throw redirect({
    to: segments.join("/"),
    search: location.search,
    replace: true,
  });
};

export const pluginNotFoundComponent = PluginNotInstalled;

/**
 * Builds a canonical `/s/<alias>/...` path from a plugin segment (an id or an
 * alias) and the path below it. Segment names are unchanged from the old
 * `/plugins` layout, so only the prefix and the plugin segment move.
 */
export const toContentPath = (pluginSegment: string, rest: string[]) =>
  ["/s", aliasForId(resolvePluginParam(pluginSegment)), ...rest].join("/");
