import React, { useRef, useEffect } from "react";
import Viewer3D from "@/UserInterface/components/Viewers/Viewer3D";

/**
 * Right Panel - 3D/2D viewers
 */
export default function RightPanel(props: { viewer3D: any }) {
  return (
    <div className="right-panel">
      <Viewer3D viewer3D={props.viewer3D} />
    </div>
  );
}
