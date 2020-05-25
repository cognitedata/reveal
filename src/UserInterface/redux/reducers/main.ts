import { combineReducers } from "redux";
import { enableMapSet } from "immer";
import settingsReducer from "./settings";
import explorerReducer from "./explorer";

// Enable immer MapSet
enableMapSet();

/**
 * The combineReducers helper function turns an object whose values
 * are different reducing functions into a single reducing function
 * that can pass to createStore.
 */

const SubsurfaceReducer = combineReducers({
  settings: settingsReducer,
  explorer: explorerReducer,
});

export default SubsurfaceReducer;
