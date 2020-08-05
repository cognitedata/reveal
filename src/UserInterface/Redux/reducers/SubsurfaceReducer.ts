import { enableMapSet, enableES5 } from "immer";

import commonReducer from "@/UserInterface/Redux/reducers/CommonReducer";
import settingsReducer from "@/UserInterface/Redux/reducers/SettingsReducer";
import explorerReducer from "@/UserInterface/Redux/reducers/ExplorerReducer";
import visualizerReducer from "@/UserInterface/Redux/reducers/VisualizersReducer";
// Enable immer MapSet
enableMapSet();
enableES5();

/**
 * The combineReducers helper function turns an object whose values
 * are different reducing functions into a single reducing function
 * that can pass to createStore.
 */

const SubsurfaceReducer = {
  common: commonReducer,
  settings: settingsReducer,
  explorer: explorerReducer,
  visualizers: visualizerReducer
};

export default SubsurfaceReducer;
