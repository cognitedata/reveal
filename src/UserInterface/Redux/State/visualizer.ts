// Visualizer component state interface

import {ToolbarCommand} from "@/UserInterface/NodeVisualizer/ToolBar/ToolbarCommand";

export interface VisualizerState {
  toolbars: { [key: string]: ToolbarCommand[] },
  targets: { [key: string]: any },
  statusBar: { text: string }
}