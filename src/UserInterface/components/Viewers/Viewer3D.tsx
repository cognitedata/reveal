import React from "react";
import VisualizerToolbar from "./VisualizerToolbar";

// 3D Viewer
export default function Viewer3D() {
  return (
    <div className="visualizer">
      <VisualizerToolbar visualizerId="3d" />
      <div id="visualizer-3d" className="visualizer-3d" />
    </div>
  );
}
