import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  currentPluginId?: string;
  corsProxyUrl?: string;
  disableAutoUpdatePlugins?: boolean;
  useMiniPlayer?: boolean;
  pluginsPreinstalled?: boolean;
  // Stored as an opt-out so that state persisted before this existed, which
  // has no key, means analytics on. Do Not Track overrides it and a build with
  // no key has nothing to enable; see lib/analytics.
  disableAnalytics?: boolean;
  cloudSync?: CloudSyncSettings;
}

export interface CloudSyncSettings {
  /** The sync plugin chosen in Settings; sync is off without one. */
  pluginId?: string;
  autoSync: boolean;
  syncIntervalSeconds: number;
}

export const defaultCloudSync: CloudSyncSettings = {
  autoSync: true,
  syncIntervalSeconds: 60,
};

const initialState: SettingsState = {};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setCurrentPluginId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        currentPluginId: action.payload,
      };
    },
    saveCorsProxyUrl: (state, action: PayloadAction<string | undefined>) => {
      return {
        ...state,
        corsProxyUrl: action.payload,
      };
    },
    toggleDisableAutoUpdatePlugins: (state) => {
      return {
        ...state,
        disableAutoUpdatePlugins: !state.disableAutoUpdatePlugins,
      };
    },
    toggleUseMiniPlayer: (state) => {
      return {
        ...state,
        useMiniPlayer: !state.useMiniPlayer,
      };
    },
    setPluginsPreInstalled: (state) => {
      return { ...state, pluginsPreinstalled: true };
    },
    setDisableAnalytics: (state, action: PayloadAction<boolean>) => {
      return { ...state, disableAnalytics: action.payload };
    },
    updateCloudSync: (
      state,
      action: PayloadAction<Partial<CloudSyncSettings>>
    ) => {
      return {
        ...state,
        cloudSync: {
          ...defaultCloudSync,
          ...state.cloudSync,
          ...action.payload,
        },
      };
    },
  },
});

export const {
  setCurrentPluginId,
  saveCorsProxyUrl,
  toggleDisableAutoUpdatePlugins,
  toggleUseMiniPlayer,
  setPluginsPreInstalled,
  setDisableAnalytics,
  updateCloudSync,
} = settingsSlice.actions;
export default settingsSlice.reducer;
