import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UiState {
  navbarOpen: boolean;
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
    setNavbarOpen: (state, action: PayloadAction<boolean>) => {
      state.navbarOpen = action.payload;
    },
  },
});

export const { toggleNavbar, setNavbarOpen } = uiSlice.actions;
export default uiSlice.reducer;
