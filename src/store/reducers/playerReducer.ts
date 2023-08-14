import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface PlayerState {
  pluginId?: string;
  apiId?: string;
  isLive?: boolean;
  channelApiId?: string;
}

const initialState: PlayerState = {};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayerInfo: (_state, action: PayloadAction<PlayerState>) => {
      return action.payload;
    },
    closePlayer: (_state) => {
      return {};
    },
  },
});

export const { setPlayerInfo, closePlayer } = playerSlice.actions;
export default playerSlice.reducer;
