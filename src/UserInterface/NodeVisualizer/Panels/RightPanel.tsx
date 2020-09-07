import React from "react";
import { ConnectedViewer3D } from "@/UserInterface/NodeVisualizer/Viewers/ConnectedViewer3D";

/**
 * Right Panel - 3D/2D viewers
 */
export function RightPanel(props: { viewer3D: any }) {
  return (
    <div className="right-panel">
      <ConnectedViewer3D viewer3D={props.viewer3D} />
    </div>
  );
}
