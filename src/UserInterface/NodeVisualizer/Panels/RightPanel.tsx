import React from "react";
import Viewer3D from "@/UserInterface/NodeVisualizer/Viewers/Viewer3D";
import StatusBar from "@/UserInterface/Components/StatusBar/StatusBar";

/**
 * Right Panel - 3D/2D viewers
 */
export default function RightPanel(props: { viewer3D: any }) {
  return (
    <div className="right-panel">
      <Viewer3D viewer3D={props.viewer3D} />
      <StatusBar />
    </div>
  );
}
