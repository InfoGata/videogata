import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  currentPluginId?: string;
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
  },
});

export const { setCurrentPluginId } = settingsSlice.actions;
export default settingsSlice.reducer;
