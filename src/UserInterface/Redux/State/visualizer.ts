// Visualizer component state interface

import { IToolbarCommand } from "@/UserInterface/NodeVisualizer/ToolBar/ToolbarCommand";

export interface VisualizerState
{
  toolbars: { [key: string]: IToolbarCommand[] },
  targets: { [key: string]: any },
  statusBar: { text: string }
}
