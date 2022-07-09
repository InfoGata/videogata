import Dexie from "dexie";
import { PluginInfo } from "./plugintypes";

class VideoDatabase extends Dexie {
  plugins: Dexie.Table<PluginInfo, string>;
  constructor() {
    super("VideoDatabase");
    this.version(1).stores({
      plugins: "id",
    });
    this.plugins = this.table("plugins");
  }
}

export const db = new VideoDatabase();
