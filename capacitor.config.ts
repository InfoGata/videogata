import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.videogata.app",
  appName: "VideoGata",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
