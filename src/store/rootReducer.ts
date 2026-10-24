import { combineReducers } from "@reduxjs/toolkit";
import queueReducer from "./reducers/queueReducer";
import settingsReducer from "./reducers/settingsReducer";
import uiReducer from "./reducers/uiReducer";
import playerReducer from "./reducers/playerReducer";

const rootReducer = combineReducers({
  ui: uiReducer,
  settings: settingsReducer,
  queue: queueReducer,
  player: playerReducer,
});

export default rootReducer;
