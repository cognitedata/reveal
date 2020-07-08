import { SettingsStateInterface } from "./settings";
import { ExplorerStateInterface } from "./explorer";
import { VisualizerStateInterface } from "./visualizers";

// TitleBar interface
export interface TitleBarInterface {
  name: string;
  icon: { type: string; name: string };
  toolBar: ToolBarType;
}

// ToolBar interface
export type ToolBarType = {
  icon: { type: string; name: string };
  selected?: boolean;
  action?: {
    type: string;
    subSectionId?: string;
  };
}[];

//Common state interface
export interface CommonStateInterface {
  isFullscreen: boolean;
}

// Redux Store
export interface ReduxStore {
  common: CommonStateInterface;
  settings: SettingsStateInterface;
  explorer: ExplorerStateInterface;
  visualizers: VisualizerStateInterface
}
