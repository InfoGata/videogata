import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import TopItemCards from "@/components/TopItemCards";
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

const mockPlugins = vi.hoisted(() => ({ plugins: [] as unknown[] }));
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
  methodDefined: async (name: string) =>
    name === "onGetUserFeed" ? opts.hasUserFeed : true,
  remote: {
    onGetUserFeed: opts.onGetUserFeed ?? (async () => ({ items: [] })),
    onGetTopItems:
      opts.onGetTopItems ?? (async () => ({ videos: { items: [] } })),
  },
});

const renderCards = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TopItemCards />
    </QueryClientProvider>
  );
};

describe("TopItemCards", () => {
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
});
