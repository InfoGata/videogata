import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Video } from "../../plugintypes";

interface QueueState {
  currentVideo?: Video;
}

const initialState: QueueState = {};

const settingsSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<Video>) => {
      return {
        ...state,
        currentVideo: action.payload,
      };
    },
  },
});

export const { setCurrentVideo } = settingsSlice.actions;
export default settingsSlice.reducer;
