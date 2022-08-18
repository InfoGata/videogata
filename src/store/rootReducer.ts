import { combineReducers } from "@reduxjs/toolkit";
import playlistReducer from "./reducers/playlistReducer";
import settingsReducer from "./reducers/settingsReducer";
import uiReducer from "./reducers/uiReducer";
import queueReducer from "./reducers/queueReducer";

const rootReducer = combineReducers({
  ui: uiReducer,
  settings: settingsReducer,
  playlist: playlistReducer,
  queue: queueReducer,
});

export default rootReducer;
