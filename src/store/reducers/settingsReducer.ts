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
}

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
        autoUpdatePlugins: !state.disableAutoUpdatePlugins,
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
  },
});

export const {
  setCurrentPluginId,
  saveCorsProxyUrl,
  toggleDisableAutoUpdatePlugins,
  toggleUseMiniPlayer,
  setPluginsPreInstalled,
  setDisableAnalytics,
} = settingsSlice.actions;
export default settingsSlice.reducer;
