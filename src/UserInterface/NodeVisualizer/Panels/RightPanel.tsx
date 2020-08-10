import React from "react";
import StatusBar from "@/UserInterface/Components/StatusBar/StatusBar";
import { ConnectedViewer3D } from "../Viewers/ConnectedViewer3D";

/**
 * Right Panel - 3D/2D viewers
 */
export default function RightPanel(props: { viewer3D: any }) {
  return (
    <div className="right-panel">
      <ConnectedViewer3D viewer3D={props.viewer3D} />
      <StatusBar />
    </div>
  );
}
