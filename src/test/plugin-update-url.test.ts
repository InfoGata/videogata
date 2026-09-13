import { afterEach, describe, expect, it, vi } from "vitest";
import { getFileTypeFromPluginUrl, getPlugin } from "@/utils";

const INSTALLED_FROM =
  "https://cdn.jsdelivr.net/gh/InfoGata/youtube-videogata@latest/manifest.json";

const manifest = () => ({
  id: "youtube",
  name: "YouTube",
  version: "1.0.0",
  script: "dist/index.js",
});

// getFileText derives every file url from the manifest url, so one stub covers
// both the manifest and the script it names.
const serve = (body: object) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url.endsWith("manifest.json")
        ? new Response(JSON.stringify(body))
        : new Response("// plugin script")
    )
  );

afterEach(() => vi.unstubAllGlobals());

describe("fetching plugin files", () => {
  it("revalidates instead of trusting a cached copy", async () => {
    // jsdelivr caches the mutable refs in the browser for a week, so a plain
    // fetch can answer an update check with a build from seven days ago.
    serve(manifest());

    await getPlugin(getFileTypeFromPluginUrl(INSTALLED_FROM));

    const calls = (globalThis.fetch as unknown as { mock: { calls: unknown[][] } })
      .mock.calls;
    expect(calls.length).toBeGreaterThan(1);
    // The manifest and the script are separate cache entries; both have to be
    // fresh or a version can be paired with code that isn't it.
    for (const [, init] of calls) {
      expect((init as RequestInit).cache).toBe("no-cache");
    }
  });
});
