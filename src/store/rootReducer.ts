import { combineReducers } from "@reduxjs/toolkit";
import playlistReducer from "./reducers/playlistReducer";
import queueReducer from "./reducers/queueReducer";
import settingsReducer from "./reducers/settingsReducer";
import uiReducer from "./reducers/uiReducer";

const rootReducer = combineReducers({
  ui: uiReducer,
  settings: settingsReducer,
  playlist: playlistReducer,
  queue: queueReducer,
});

export default rootReducer;
