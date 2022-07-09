import { combineReducers } from "@reduxjs/toolkit";
import settingsReducer from "./reducers/settingsReducer";
import uiReducer from "./reducers/uiReducer";

const rootReducer = combineReducers({
  ui: uiReducer,
  settings: settingsReducer,
});

export default rootReducer;
