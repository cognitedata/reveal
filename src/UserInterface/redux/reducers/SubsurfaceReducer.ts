import { enableMapSet } from "immer";
import settingsReducer from "./SettingsReducer";
import explorerReducer from "./ExplorerReducer";

// Enable immer MapSet
enableMapSet();

/**
 * The combineReducers helper function turns an object whose values
 * are different reducing functions into a single reducing function
 * that can pass to createStore.
 */

const SubsurfaceReducer = {
  settings: settingsReducer,
  explorer: explorerReducer,
};

export default SubsurfaceReducer;