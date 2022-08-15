import Dexie from "dexie";
import { Playlist, PluginInfo } from "./plugintypes";

class VideoDatabase extends Dexie {
  plugins: Dexie.Table<PluginInfo, string>;
  playlists: Dexie.Table<Playlist, string>;

  constructor() {
    super("VideoDatabase");
    this.version(1).stores({
      plugins: "id",
      playlists: "id",
    });
    this.plugins = this.table("plugins");
    this.playlists = this.table("playlists");
  }
}

export const db = new VideoDatabase();
