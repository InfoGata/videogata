import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  currentPluginId?: string;
  corsProxyUrl?: string;
  disableAutoUpdatePlugins?: boolean;
  useMiniPlayer?: boolean;
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
  },
});

export const {
  setCurrentPluginId,
  saveCorsProxyUrl,
  toggleDisableAutoUpdatePlugins,
  toggleUseMiniPlayer,
} = settingsSlice.actions;
export default settingsSlice.reducer;
