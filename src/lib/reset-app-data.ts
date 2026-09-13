/**
 * The escape hatch behind AppErrorBoundary. When the app can't get far enough to
 * render anything, the cause is almost always local state rather than the code:
 * a plugin script that now throws on load, a persisted Redux state written in an
 * older shape, a half-applied Dexie upgrade.
 *
 * The deletion runs on the *next* boot rather than on the click. IndexedDB only
 * completes a `deleteDatabase` once every connection to that database is closed,
 * and by the time the boundary renders, Dexie is holding one that nothing
 * reachable from the fallback can close. So the click records the intent and
 * reloads, and the work happens in main.tsx, before the app is imported and a
 * connection has been opened.
 *
 * On Android, plugin scripts are stored as files (see storage/pluginStorage.ts).
 * Those aren't removed here: without their database rows nothing loads them,
 * and reinstalling a plugin overwrites them.
 */

const RESET_FLAG = "videogata:reset-app-data";

/**
 * Deleted even when `indexedDB.databases()` isn't available to enumerate them
 * (Firefox only shipped it in 126). Keep in sync with src/database.ts.
 */
const KNOWN_DATABASES = ["VideoDatabase"];

/** Everything redux-persist owns; see the persist config in store/store.ts. */
const LOCAL_STORAGE_PREFIX = "persist:";

/** localStorage throws outright when site data is blocked, so every use is guarded. */
const readFlag = (): boolean => {
  try {
    return window.localStorage.getItem(RESET_FLAG) === "1";
  } catch {
    return false;
  }
};

/**
 * Records the request and reloads. Nothing is deleted here — see the note above
 * on why that has to wait for the next boot.
 */
export const requestAppDataReset = () => {
  try {
    window.localStorage.setItem(RESET_FLAG, "1");
  } catch {
    // Without storage there is nothing persisted to reset either, so a plain
    // reload is already the whole operation.
  }
  window.location.reload();
};

const deleteDatabase = (name: string) =>
  new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    // Every outcome resolves, including `blocked`: a reset that can't finish
    // must not be able to stop the app from booting.
    request.onsuccess = request.onerror = request.onblocked = () => resolve();
  });

const databasesToDelete = async (): Promise<string[]> => {
  const names = new Set(KNOWN_DATABASES);
  // Picks up databases added since this file was written. Filtered by name
  // rather than taken wholesale, because the origin isn't necessarily ours
  // alone — the extension and any host page can put storage here too.
  try {
    const existing = (await indexedDB.databases?.()) ?? [];
    for (const { name } of existing) {
      if (name?.toLowerCase().startsWith("video")) names.add(name);
    }
  } catch {
    // Enumeration is a bonus; KNOWN_DATABASES is the contract.
  }
  return [...names];
};

/**
 * Called once at startup, before any provider mounts. A no-op unless a reset was
 * requested.
 */
export const runPendingAppDataReset = async (): Promise<void> => {
  if (!readFlag()) return;

  // Cleared first, and deliberately before the awaits below: if a deletion hangs
  // or the tab is closed mid-reset, the next boot should start the app rather
  // than sit in a reset loop.
  try {
    window.localStorage.removeItem(RESET_FLAG);
    const persisted = Object.keys(window.localStorage).filter((key) =>
      key.startsWith(LOCAL_STORAGE_PREFIX)
    );
    for (const key of persisted) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // See readFlag.
  }

  const names = await databasesToDelete();
  await Promise.all(names.map(deleteDatabase));
};
