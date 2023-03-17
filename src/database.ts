import Dexie from "dexie";
import {
  Channel,
  Playlist,
  PlaylistInfo,
  PluginInfo,
  Video,
} from "./plugintypes";

class VideoDatabase extends Dexie {
  plugins: Dexie.Table<PluginInfo, string>;
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
    this.plugins = this.table("plugins");
    this.playlists = this.table("playlists");
    this.favoriteVideos = this.table("favoriteVideos");
    this.favoriteChannels = this.table("favoriteChannels");
    this.favoritePlaylists = this.table("favoritePlaylists");
  }
}

export const db = new VideoDatabase();
