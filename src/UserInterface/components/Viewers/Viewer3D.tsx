import React from "react";
import { useSelector } from "react-redux";
import VisualizerToolbar from "./VisualizerToolbar";
import { ReduxStore } from "@/UserInterface/interfaces/common";

// 3D Viewer
export default function Viewer3D(props: { viewer3D: any }) {
  const toolbar = useSelector((state: ReduxStore) => state.visualizers.toolbars["3D"]);
  return (
    <div className="visualizer">
      <VisualizerToolbar visualizerId="3D" toolbar={toolbar} />
      <div ref={props.viewer3D} id="visualizer-3d" className="visualizer-3d" />
    </div>
  );
}
