
import { combineReducers } from "redux";
import explorerReducer from "./explorer";
import settingsReducer from "./settings";
import nodeReducer from "./nodes";

/**
 * The combineReducers helper function turns an object whose values
 * are different reducing functions into a single reducing function
 * that can pass to createStore.
 */
export default combineReducers({
  explorer: explorerReducer,
  settings: settingsReducer,
  nodes: nodeReducer
});