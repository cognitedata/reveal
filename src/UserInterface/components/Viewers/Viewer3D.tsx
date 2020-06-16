import React from "react";
import { useSelector } from "react-redux";
import VisualizerToolbar from "./VisualizerToolbar";
import { ReduxStore } from "@/UserInterface/interfaces/common";

// 3D Viewer
export default function Viewer3D() {
  const toolbar = useSelector((state: ReduxStore) => state.visualizers.toolBars["3d"]);
  return (
    <div className="visualizer">
      <VisualizerToolbar visualizerId="3d" toolbar={toolbar} />
      <div id="visualizer-3d" className="visualizer-3d" />
    </div>
  );
}
