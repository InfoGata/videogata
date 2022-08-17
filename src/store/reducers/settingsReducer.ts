import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  currentPluginId?: string;
  corsProxyUrl?: string;
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
  },
});

export const { setCurrentPluginId, saveCorsProxyUrl } = settingsSlice.actions;
export default settingsSlice.reducer;
