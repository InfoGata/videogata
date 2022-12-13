import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  navbarOpen: boolean;
  waitingServiceWorker?: ServiceWorker;
}

const initialState: UiState = {
  navbarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleNavbar: (state) => {
      return {
        ...state,
        navbarOpen: !state.navbarOpen,
      };
    },
    updateReady(state, action: PayloadAction<ServiceWorker>) {
      state.waitingServiceWorker = action.payload;
    },
  },
});

export const { toggleNavbar, updateReady } = uiSlice.actions;
export default uiSlice.reducer;
