import { enableMapSet, enableES5 } from "immer";
// Enable immer MapSet
enableMapSet();
enableES5();

import settingsReducer from "./SettingsReducer";
import explorerReducer from "./ExplorerReducer";
import visualizerReducer from "./VisualizersReducer";

/**
 * The combineReducers helper function turns an object whose values
 * are different reducing functions into a single reducing function
 * that can pass to createStore.
 */

const SubsurfaceReducer = {
  settings: settingsReducer,
  explorer: explorerReducer,
  visualizers: visualizerReducer
};

export default SubsurfaceReducer;