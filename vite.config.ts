import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  // Vite 8 switched to Rolldown and made CJS default-import interop "consistent"
  // (default = full module.exports), which breaks CJS deps that use the
  // `exports.default` + `__esModule` pattern without an ESM build (e.g.
  // redux-persist). Restore the pre-Vite-8 behavior.
  legacy: {
    inconsistentCjsInterop: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["fake-indexeddb/auto", "src/test/before.ts"],
    teardownTimeout: 5000,
  },
  plugins: [
    tailwindcss(),
    react(),
    tanstackRouter({ target: "react" }),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      // "autoUpdate" so a client stuck on a stale precached index.html recovers on
      // its own instead of waiting for a SKIP_WAITING message from a page that
      // failed to boot. Unlike generateSW, injectManifest does not get
      // skipWaiting/clientsClaim injected — src/sw.ts does that itself.
      registerType: "autoUpdate",
      workbox: {
        navigateFallback: "/",
        navigateFallbackDenylist: [
          /\.html$/,
          /\.html\?/,
          /login_popup\.html/,
        ],
      },
      manifest: {
        short_name: "VideoGata",
        name: "VideoGata",
        icons: [
          {
            src: "favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "logo192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "logo512.png",
            type: "image/png",
            sizes: "512x512",
          },
        ],
        start_url: ".",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#ffffff",
      },
    }),
  ],
  // Unique port per app in ~/projects/webapps; strictPort so a collision fails
  // loudly instead of drifting to the next free port.
  server: {
    port: 3006,
    strictPort: true,
    open: true,
  },
  preview: {
    port: 4006,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
