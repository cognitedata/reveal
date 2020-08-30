import { enableMapSet, enableES5 } from "immer";

import commonReducer from "@/UserInterface/Redux/reducers/CommonReducer";
import settingsReducer from "@/UserInterface/Redux/reducers/SettingsReducer";
import explorerReducer from "@/UserInterface/Redux/reducers/ExplorerReducer";
import visualizerReducer from "@/UserInterface/Redux/reducers/VisualizersReducer";
// Enable immer MapSet
enableMapSet();
enableES5();

/**
 * Combines child reducers to root NodeVisualizerReducer
 */

const NodeVisualizerReducer = {
  common: commonReducer,
  settings: settingsReducer,
  explorer: explorerReducer,
  visualizers: visualizerReducer
};

export default NodeVisualizerReducer;
