import React from "react";
import { ConnectedViewer3D } from "@/UserInterface/NodeVisualizer/Viewers/ConnectedViewer3D";
import { VisualizerToolbarProps } from "@/UserInterface/NodeVisualizer/ToolBar/VisualizerToolbar";

/**
 * Right Panel - 3D/2D viewers
 */
export function RightPanel(props: {
  viewer3D: React.RefCallback<HTMLElement>;
  toolbar: React.ComponentType<VisualizerToolbarProps>;
}) {
  return (
    <div className="right-panel">
      <ConnectedViewer3D viewer3D={props.viewer3D} toolbar={props.toolbar} />
    </div>
  );
}
