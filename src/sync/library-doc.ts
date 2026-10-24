import * as A from "@automerge/automerge";
import type { Channel, Playlist, PlaylistInfo, Video } from "@/plugintypes";

/**
 * The user's library: everything that syncs between devices. It is the only
 * copy on this device too -- there is no Dexie table mirroring it.
 */
export type LibraryDoc = {
  /** Keyed by playlist id. */
  playlists: { [id: string]: Playlist };
  /** Keyed by favoriteKey(), so one item favorited on two devices is one entry. */
  favorites: {
    videos: { [key: string]: Video };
    channels: { [key: string]: Channel };
    playlists: { [key: string]: PlaylistInfo };
  };
};

export type FavoriteType = keyof LibraryDoc["favorites"];
export type FavoriteItem = Video | Channel | PlaylistInfo;

/**
 * Every device starts its library from these exact bytes rather than from
 * `repo.create()`. Two documents that never shared a first change each create
 * their own `playlists` and `favorites` maps, and merging them keeps only one
 * of each -- the other device's library silently disappears. Starting from a
 * shared first change makes those maps the same objects everywhere, so merges
 * only ever combine what is inside them.
 *
 * Generated once with a fixed actor and `time: 0`:
 *   A.change(A.init({ actor: "0".repeat(32) }), { time: 0, message: "genesis" },
 *     (d) => { d.playlists = {}; d.favorites = { videos: {}, channels: {}, playlists: {} } })
 * Never regenerate it: a different genesis can't merge with libraries that
 * already exist in the cloud.
 */
const GENESIS_BASE64 =
  "hW9Kg5OgnhgAsgEBEAAAAAAAAAAAAAAAAAAAAAABQ2JLW+Vj1aG7DFpRNBDEDCwQULE4kzwTNraKf3N4Ns4HAQIDAhMCIwI1CUACVgIJAQQCBBUvIQIjBjQBQgJWAoABAn8AfwF/BX8AfwdnZW5lc2lzfwB/BwACAwAAAgMCewlmYXZvcml0ZXMJcGxheWxpc3RzCGNoYW5uZWxzCXBsYXlsaXN0cwZ2aWRlb3MFAH0CfwICAQUFAAUABQAA";

export const GENESIS_HEADS = [
  "43624b5be563d5a1bb0c5a513410c40c2c1050b138933c1336b68a7f737836ce",
];

export const genesisBytes = (): Uint8Array =>
  Uint8Array.from(atob(GENESIS_BASE64), (c) => c.charCodeAt(0));

/** Whether a document descends from the shared genesis, and so can be merged. */
export const isLibraryDoc = (doc: A.Doc<unknown>): boolean =>
  A.hasHeads(doc, GENESIS_HEADS);

export const favoriteKey = (item: FavoriteItem): string | undefined => {
  if (item.pluginId && item.apiId) return `${item.pluginId}:${item.apiId}`;
  return item.id;
};

/**
 * Automerge rejects `undefined`, which plugin data is full of (every optional
 * field a plugin didn't fill in). Drop those keys before storing anything.
 */
export function sanitizeForAutomerge<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForAutomerge(item)) as T;
  }
  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) sanitized[key] = sanitizeForAutomerge(value);
    }
    return sanitized as T;
  }
  return obj;
}

/**
 * Plain copy out of an automerge document. Documents are frozen proxies, and
 * the rest of the app mutates what it's given (setting `id`, `pluginId`, ...).
 */
export const toPlain = <T>(value: T): T =>
  value === undefined ? value : JSON.parse(JSON.stringify(value));
