import type { AutomergeUrl, DocHandle } from "@automerge/automerge-repo";
import { Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { db } from "@/database";
import type { Playlist, PlaylistInfo, Video } from "@/plugintypes";
import {
  genesisBytes,
  isLibraryDoc,
  toPlain,
  type FavoriteItem,
  type FavoriteType,
  type LibraryDoc,
} from "./library-doc";
import * as ops from "./library-ops";

export const LIBRARY_DB_NAME = "videogata-library";
export const LIBRARY_DOC_URL_KEY = "videogata-library-doc-url";
const LEGACY_IMPORTED_KEY = "videogata-library-legacy-imported";

let repo: Repo | undefined;
let handlePromise: Promise<DocHandle<LibraryDoc>> | undefined;

export const getLibraryRepo = (): Repo =>
  (repo ??= new Repo({
    storage: new IndexedDBStorageAdapter(LIBRARY_DB_NAME),
    // Keeps tabs in the same browser in step without a round trip to the cloud.
    network: [new BroadcastChannelNetworkAdapter()],
  }));

/**
 * The library document, created from the shared genesis on first use. Module
 * level rather than React state so the plugin API and anything outside a
 * component can reach it.
 */
export const getLibraryHandle = (): Promise<DocHandle<LibraryDoc>> =>
  (handlePromise ??= openLibrary().catch((e) => {
    handlePromise = undefined;
    throw e;
  }));

async function openLibrary(): Promise<DocHandle<LibraryDoc>> {
  const repo = getLibraryRepo();
  const storedUrl = localStorage.getItem(LIBRARY_DOC_URL_KEY);
  if (storedUrl) {
    try {
      const handle = await repo.find<LibraryDoc>(storedUrl as AutomergeUrl);
      if (isLibraryDoc(handle.doc())) return handle;
    } catch (e) {
      console.error("Couldn't open the library document, starting a new one", e);
    }
  }
  const handle = repo.import<LibraryDoc>(genesisBytes());
  localStorage.setItem(LIBRARY_DOC_URL_KEY, handle.url);
  await importLegacyTables(handle);
  return handle;
}

/**
 * Playlists and favorites used to live in Dexie tables. Move whatever is there
 * into the document once, then empty the tables so it can't happen twice.
 */
async function importLegacyTables(handle: DocHandle<LibraryDoc>) {
  if (localStorage.getItem(LEGACY_IMPORTED_KEY)) return;
  try {
    const [playlists, videos, channels, favoritePlaylists] =
      await Promise.all([
        db.playlists.toArray(),
        db.favoriteVideos.toArray(),
        db.favoriteChannels.toArray(),
        db.favoritePlaylists.toArray(),
      ]);
    handle.change((d) => {
      ops.putPlaylists(d, playlists);
      ops.addFavorites(d, "videos", videos);
      ops.addFavorites(d, "channels", channels);
      ops.addFavorites(d, "playlists", favoritePlaylists);
    });
    await Promise.all([
      db.playlists.clear(),
      db.favoriteVideos.clear(),
      db.favoriteChannels.clear(),
      db.favoritePlaylists.clear(),
    ]);
  } catch (e) {
    console.error("Couldn't import playlists and favorites", e);
  }
  localStorage.setItem(LEGACY_IMPORTED_KEY, "true");
}

const change = async (fn: (doc: LibraryDoc) => void) => {
  const handle = await getLibraryHandle();
  handle.change(fn);
};

const current = async () => (await getLibraryHandle()).doc();

export const toPlaylistInfo = (playlist: Playlist): PlaylistInfo => {
  const { videos: _videos, ...info } = playlist;
  return info;
};

export const getPlaylists = async (): Promise<Playlist[]> =>
  toPlain(Object.values((await current()).playlists));

export const getPlaylistsInfo = async (): Promise<PlaylistInfo[]> =>
  (await getPlaylists()).map(toPlaylistInfo);

export const getPlaylist = async (id: string): Promise<Playlist | undefined> =>
  toPlain((await current()).playlists[id]);

/** Returns the new playlist's id. */
export const addPlaylist = async (playlist: Playlist): Promise<string> => {
  let id = "";
  await change((d) => {
    id = ops.addPlaylist(d, playlist);
  });
  return id;
};

export const addPlaylists = (playlists: Playlist[]) =>
  change((d) => ops.putPlaylists(d, playlists));

export const deletePlaylist = (playlist: PlaylistInfo) =>
  change((d) => playlist.id && ops.deletePlaylist(d, playlist.id));

export const updatePlaylist = (info: PlaylistInfo) =>
  change((d) => ops.updatePlaylist(d, info));

export const addPlaylistVideos = (playlist: PlaylistInfo, videos: Video[]) =>
  change((d) => playlist.id && ops.addPlaylistVideos(d, playlist.id, videos));

export const setPlaylistVideos = (playlist: PlaylistInfo, videos: Video[]) =>
  change((d) => playlist.id && ops.setPlaylistVideos(d, playlist.id, videos));

export const addFavorites = (type: FavoriteType, items: FavoriteItem[]) =>
  change((d) => ops.addFavorites(d, type, items));

export const addFavorite = (type: FavoriteType, item: FavoriteItem) =>
  addFavorites(type, [item]);

export const removeFavorite = (type: FavoriteType, item: FavoriteItem) =>
  change((d) => ops.removeFavorite(d, type, item));

export const isFavorite = async (type: FavoriteType, item: FavoriteItem) =>
  ops.isFavorite(await current(), type, item);

/** For the data reset: forget the document so the next open starts fresh. */
export const forgetLibrary = () => {
  localStorage.removeItem(LIBRARY_DOC_URL_KEY);
  localStorage.removeItem(LEGACY_IMPORTED_KEY);
};
