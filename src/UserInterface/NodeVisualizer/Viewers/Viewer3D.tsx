import React from "react";
import { useSelector } from "react-redux";
import {State} from "@/UserInterface/Redux/State/State";
import VisualizerToolbar from "@/UserInterface/NodeVisualizer/ToolBar/VisualizerToolbar";

// 3D Viewer
export default function Viewer3D(props: { viewer3D: any }) {
  const toolbar = useSelector((state: State) => state.visualizers.toolbars["3D"]); //TODO: remove state reference
  return (
    <div className="visualizer">
      <VisualizerToolbar visualizerId="3D" toolbar={toolbar} />
      <div ref={props.viewer3D} id="visualizer-3d" className="visualizer-3d" />
    </div>
  );
}
