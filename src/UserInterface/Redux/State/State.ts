import { ISettingsState } from "@/UserInterface/Redux/State/settings";
import { IExplorerState } from "@/UserInterface/Redux/State/explorer";
import { ICommonState } from "@/UserInterface/Redux/State/common";
import { IVisualizerState } from "@/UserInterface/Redux/State/visualizer";

// Top level state for the sub-surface component
export interface State {
  common: ICommonState;
  settings: ISettingsState;
  explorer: IExplorerState;
  visualizers: IVisualizerState
}
