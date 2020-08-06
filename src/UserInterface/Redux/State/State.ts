import { ISettingsState } from "@/UserInterface/Redux/State/settings";
import { IExplorerState } from "@/UserInterface/Redux/State/explorer";
import { CommonState } from "@/UserInterface/Redux/State/common";
import { VisualizerState } from "@/UserInterface/Redux/State/visualizer";

// Top level state for the sub-surface component
export interface State
{
  common: CommonState;
  settings: ISettingsState;
  explorer: IExplorerState;
  visualizers: VisualizerState
}
