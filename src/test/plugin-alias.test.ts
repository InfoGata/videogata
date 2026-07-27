import { describe, expect, it, beforeEach } from "vitest";
import {
  aliasForId,
  aliasFromName,
  assignAlias,
  normalizeAlias,
  resolvePluginParam,
  setPluginAliases,
  validateAlias,
} from "@/lib/plugin-alias";
import { toContentPath } from "@/lib/plugin-route";
import { defaultPlugins } from "@/default-plugins";

describe("normalizeAlias", () => {
  it("slugifies plugin names", () => {
    expect(normalizeAlias("Youtube Plugin for VideoGata")).toBe(
      "youtube-plugin-for-videogata"
    );
    expect(normalizeAlias("  Google_Drive  ")).toBe("google-drive");
    expect(normalizeAlias("4chan!!")).toBe("4chan");
  });

  it("never produces a leading or trailing dash", () => {
    expect(normalizeAlias("--youtube--")).toBe("youtube");
    expect(normalizeAlias("!!!")).toBe("");
    // Clamping must not leave the dash the cut lands on.
    expect(normalizeAlias(`${"a".repeat(31)}-bcdef`)).toBe("a".repeat(31));
  });
});

describe("aliasFromName", () => {
  it("drops the boilerplate plugins are named with", () => {
    expect(aliasFromName("Plugin for Youtube")).toBe("youtube");
    expect(aliasFromName("Plugin for Google Drive")).toBe("google-drive");
    expect(aliasFromName("Youtube Plugin for VideoGata")).toBe("youtube");
    expect(aliasFromName("Youtube")).toBe("youtube");
  });

  it("keeps the whole name when cutting would leave nothing", () => {
    expect(aliasFromName("Plugin for VideoGata")).toBe("videogata");
    expect(aliasFromName("Plugin")).toBe("plugin");
  });

  it("matches the alias every default plugin declares", () => {
    // A `/s/<alias>/...` url for a plugin that isn't installed yet is looked up
    // in defaultPlugins, then installed and assigned an alias from its name.
    // Those two have to agree or the url stops resolving right after install.
    for (const plugin of defaultPlugins) {
      expect(aliasFromName(plugin.name)).toBe(plugin.alias);
    }
  });
});

describe("validateAlias", () => {
  const plugins = [
    { id: "abc123", alias: "youtube" },
    { id: "vimeo-id", alias: "vimeo" },
  ];

  it("accepts a free, normalized alias", () => {
    expect(validateAlias("rumble", plugins)).toBeNull();
  });

  it("rejects unnormalized input", () => {
    expect(validateAlias("Youtube Two", plugins)).toBe("invalid");
  });

  it("rejects one character aliases", () => {
    expect(validateAlias("y", plugins)).toBe("tooShort");
  });

  it("rejects an alias that is some plugin's id", () => {
    expect(validateAlias("abc123", plugins)).toBe("isPluginId");
  });

  it("rejects an alias another plugin holds", () => {
    expect(validateAlias("youtube", plugins)).toBe("taken");
  });

  it("allows a plugin to keep its own alias", () => {
    expect(validateAlias("youtube", plugins, "abc123")).toBeNull();
  });
});

describe("assignAlias", () => {
  it("hands out the requested alias when free", () => {
    expect(assignAlias("youtube", [])).toBe("youtube");
  });

  it("suffixes rather than failing when taken", () => {
    const plugins = [{ id: "a", alias: "youtube" }];
    expect(assignAlias("youtube", plugins)).toBe("youtube-2");

    plugins.push({ id: "b", alias: "youtube-2" });
    expect(assignAlias("youtube", plugins)).toBe("youtube-3");
  });

  it("derives one from a plugin name", () => {
    expect(assignAlias("Rumble Videos", [])).toBe("rumble-videos");
  });

  it("gives up when nothing usable is left", () => {
    expect(assignAlias("!", [])).toBeUndefined();
  });
});

describe("the alias registry", () => {
  beforeEach(() => {
    setPluginAliases([
      { id: "youtube-plugin-id", alias: "youtube" },
      { id: "old-youtube-id", alias: "youtube-2" },
      { id: "no-alias-id" },
    ]);
  });

  it("resolves an alias to its plugin id", () => {
    expect(resolvePluginParam("youtube")).toBe("youtube-plugin-id");
    expect(resolvePluginParam("youtube-2")).toBe("old-youtube-id");
  });

  it("passes plugin ids through, so old urls keep working", () => {
    expect(resolvePluginParam("no-alias-id")).toBe("no-alias-id");
    expect(resolvePluginParam("youtube-plugin-id")).toBe("youtube-plugin-id");
  });

  it("passes unknown segments through for notFound to handle", () => {
    expect(resolvePluginParam("vimeo")).toBe("vimeo");
  });

  it("falls back to the base alias when a shared url deduped elsewhere", () => {
    setPluginAliases([{ id: "only-one", alias: "youtube-2" }]);
    // Shared as `/s/youtube/...` by someone whose install got the plain name.
    expect(resolvePluginParam("youtube")).toBe("only-one");
  });

  it("prefers the lowest suffix among base alias matches", () => {
    setPluginAliases([
      { id: "tenth", alias: "youtube-10" },
      { id: "second", alias: "youtube-2" },
    ]);
    expect(resolvePluginParam("youtube")).toBe("second");
  });

  it("maps ids back to aliases, unchanged when there is none", () => {
    expect(aliasForId("youtube-plugin-id")).toBe("youtube");
    expect(aliasForId("no-alias-id")).toBe("no-alias-id");
    // Keeps stringify a fixed point for values already in url form.
    expect(aliasForId("youtube")).toBe("youtube");
  });
});

describe("toContentPath", () => {
  beforeEach(() => {
    setPluginAliases([{ id: "youtube-plugin-id", alias: "youtube" }]);
  });

  it("rewrites old plugin urls to the canonical content form", () => {
    expect(toContentPath("youtube-plugin-id", ["videos", "abc"])).toBe(
      "/s/youtube/videos/abc"
    );
    expect(
      toContentPath("youtube-plugin-id", ["channels", "chan1", "live"])
    ).toBe("/s/youtube/channels/chan1/live");
  });

  it("accepts an alias as well as an id", () => {
    expect(toContentPath("youtube", ["playlists"])).toBe("/s/youtube/playlists");
  });

  it("leaves an unknown plugin segment alone", () => {
    expect(toContentPath("unknown-id", ["videos", "abc"])).toBe(
      "/s/unknown-id/videos/abc"
    );
  });
});
