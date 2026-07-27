import Dexie from "dexie";
import {
  Channel,
  Playlist,
  PlaylistInfo,
  PluginInfo,
  Video,
} from "./plugintypes";
import { PluginAuthentication } from "./types";
import { aliasFromName, assignAlias } from "./lib/plugin-alias";

class VideoDatabase extends Dexie {
  plugins: Dexie.Table<PluginInfo, string>;
  pluginAuths: Dexie.Table<PluginAuthentication, string>;
  playlists: Dexie.Table<Playlist, string>;
  favoriteVideos: Dexie.Table<Video, string>;
  favoriteChannels: Dexie.Table<Channel, string>;
  favoritePlaylists: Dexie.Table<PlaylistInfo, string>;

  constructor() {
    super("VideoDatabase");
    this.version(1).stores({
      plugins: "id",
      playlists: "id",
    });
    this.version(2).stores({
      favoriteVideos: "id, [pluginId+apiId]",
      favoriteChannels: "id, [pluginId+apiId]",
      favoritePlaylists: "id, [pluginId+apiId]",
    });
    this.version(3).stores({
      pluginAuths: "pluginId",
    });
    // Aliases are indexed but not unique: they're optional, and uniqueness is
    // enforced when one is assigned (see lib/plugin-alias).
    this.version(4)
      .stores({
        plugins: "id, alias",
      })
      .upgrade(async (tx) => {
        const table = tx.table<PluginInfo, string>("plugins");
        const plugins = await table.toArray();
        // Give plugins installed before aliases existed one now, deduped the
        // same way a fresh install would be.
        const assigned: PluginInfo[] = [];
        for (const plugin of plugins) {
          plugin.alias = assignAlias(
            plugin.manifest?.alias ?? aliasFromName(plugin.name),
            assigned,
            plugin.id
          );
          assigned.push(plugin);
          await table.put(plugin);
        }
      });
    this.plugins = this.table("plugins");
    this.playlists = this.table("playlists");
    this.favoriteVideos = this.table("favoriteVideos");
    this.favoriteChannels = this.table("favoriteChannels");
    this.favoritePlaylists = this.table("favoritePlaylists");
    this.pluginAuths = this.table("pluginAuths");
  }
}

export const db = new VideoDatabase();
