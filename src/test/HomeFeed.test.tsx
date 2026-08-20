import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import HomeFeed from "@/components/HomeFeed";
import i18next from "@/i18n";
import { Video } from "@/plugintypes";

const PLUGIN_ID = "plugin-1";

// The picker writes to redux and i18n, neither of which is what these cases are
// about; it just has to hand the component a plugin id.
vi.mock("@/components/SelectPlugin", () => {
  const MockSelectPlugin = (props: { setPluginId: (id: string) => void }) => {
    const { setPluginId } = props;
    React.useEffect(() => {
      setPluginId(PLUGIN_ID);
    }, [setPluginId]);
    return null;
  };
  return { default: MockSelectPlugin };
});

vi.mock("@/components/HomeVideoCard", () => ({
  default: ({ video }: { video: Video }) => <div>{video.title}</div>,
}));

const mockPlugins = vi.hoisted(() => ({
  plugins: [] as unknown[],
  pluginsLoaded: true,
}));
vi.mock("@/hooks/usePlugins", () => ({
  default: () => mockPlugins,
}));

const video = (title: string): Video => ({
  apiId: title,
  title,
  images: [],
});

const makePlugin = (opts: {
  hasUserFeed: boolean;
  onGetUserFeed?: () => Promise<{ items: Video[] }>;
  onGetTopItems?: () => Promise<{ videos: { items: Video[] } }>;
}) => ({
  id: PLUGIN_ID,
  name: "Test Plugin",
  methodDefined: async (name: string) =>
    name === "onGetUserFeed" ? opts.hasUserFeed : true,
  remote: {
    onGetUserFeed: opts.onGetUserFeed ?? (async () => ({ items: [] })),
    onGetTopItems:
      opts.onGetTopItems ?? (async () => ({ videos: { items: [] } })),
  },
});

const renderCards = (props: React.ComponentProps<typeof HomeFeed> = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <HomeFeed {...props} />
    </QueryClientProvider>
  );
};

describe("HomeFeed", () => {
  afterEach(() => {
    cleanup();
    mockPlugins.plugins = [];
  });

  test("prefers the user's own feed when the plugin has one", async () => {
    const onGetTopItems = vi.fn(async () => ({
      videos: { items: [video("Trending")] },
    }));
    mockPlugins.plugins = [
      makePlugin({
        hasUserFeed: true,
        onGetUserFeed: async () => ({ items: [video("From your feed")] }),
        onGetTopItems,
      }),
    ];

    renderCards();

    await waitFor(() =>
      expect(screen.getByText("From your feed")).toBeInTheDocument()
    );
    expect(onGetTopItems).not.toHaveBeenCalled();
  });

  test("falls back to top items when the plugin has no user feed", async () => {
    mockPlugins.plugins = [
      makePlugin({
        hasUserFeed: false,
        onGetTopItems: async () => ({ videos: { items: [video("Trending")] } }),
      }),
    ];

    renderCards();

    await waitFor(() =>
      expect(screen.getByText("Trending")).toBeInTheDocument()
    );
  });

  test("falls back to top items when the user feed is empty", async () => {
    mockPlugins.plugins = [
      makePlugin({
        hasUserFeed: true,
        onGetUserFeed: async () => ({ items: [] }),
        onGetTopItems: async () => ({ videos: { items: [video("Trending")] } }),
      }),
    ];

    renderCards();

    await waitFor(() =>
      expect(screen.getByText("Trending")).toBeInTheDocument()
    );
  });

  test("falls back to top items when the user feed throws", async () => {
    mockPlugins.plugins = [
      makePlugin({
        hasUserFeed: true,
        onGetUserFeed: async () => {
          throw new Error("not signed in");
        },
        onGetTopItems: async () => ({ videos: { items: [video("Trending")] } }),
      }),
    ];

    renderCards();

    await waitFor(() =>
      expect(screen.getByText("Trending")).toBeInTheDocument()
    );
  });

  test("names the source as the user's feed when that's what it showed", async () => {
    mockPlugins.plugins = [
      makePlugin({
        hasUserFeed: true,
        onGetUserFeed: async () => ({ items: [video("From your feed")] }),
      }),
    ];

    renderCards();

    await waitFor(() =>
      expect(screen.getByText("From your feed")).toBeInTheDocument()
    );
    expect(
      screen.getByRole("heading", { level: 2, name: i18next.t("yourFeed") })
    ).toBeInTheDocument();
  });

  test("names the source as top items when it fell back", async () => {
    mockPlugins.plugins = [
      makePlugin({
        hasUserFeed: true,
        onGetUserFeed: async () => ({ items: [] }),
        onGetTopItems: async () => ({ videos: { items: [video("Trending")] } }),
      }),
    ];

    renderCards();

    await waitFor(() =>
      expect(screen.getByText("Trending")).toBeInTheDocument()
    );
    expect(
      screen.getByRole("heading", { level: 2, name: i18next.t("topItems") })
    ).toBeInTheDocument();
  });

  test("offers a retry when the plugin fails outright", async () => {
    mockPlugins.plugins = [
      makePlugin({
        hasUserFeed: false,
        onGetTopItems: async () => {
          throw new Error("plugin is down");
        },
      }),
    ];

    renderCards();

    await waitFor(() =>
      expect(screen.getByText(i18next.t("homeFeedError"))).toBeInTheDocument()
    );
    expect(
      screen.getByRole("button", { name: i18next.t("retry") })
    ).toBeInTheDocument();
  });

  test("shows an empty state rather than a bare grid when nothing comes back", async () => {
    mockPlugins.plugins = [
      makePlugin({ hasUserFeed: false, onGetTopItems: async () => ({ videos: { items: [] } }) }),
    ];

    renderCards();

    await waitFor(() =>
      expect(screen.getByText(i18next.t("homeFeedEmpty"))).toBeInTheDocument()
    );
  });

  test("reports whether it has a feed so the page can offer install cards", async () => {
    const onFeedResolved = vi.fn();
    mockPlugins.plugins = [
      makePlugin({ hasUserFeed: false, onGetTopItems: async () => ({ videos: { items: [] } }) }),
    ];

    renderCards({ onFeedResolved });

    await waitFor(() => expect(onFeedResolved).toHaveBeenCalledWith(false));

    cleanup();
    onFeedResolved.mockClear();
    mockPlugins.plugins = [
      makePlugin({
        hasUserFeed: false,
        onGetTopItems: async () => ({ videos: { items: [video("Trending")] } }),
      }),
    ];

    renderCards({ onFeedResolved });

    await waitFor(() => expect(onFeedResolved).toHaveBeenCalledWith(true));
  });
});
