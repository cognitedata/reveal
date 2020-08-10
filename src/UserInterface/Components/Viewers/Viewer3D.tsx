import React from "react";
import VisualizerToolbar, {
  IToolbarButton
} from "@/UserInterface/NodeVisualizer/ToolBar/VisualizerToolbar";

// 3D Viewer
export default function Viewer3D(props: {
  viewer3D: any;
  toolbar?: IToolbarButton[];
  onToolbarButtonClick: (visualizerId: string, index: any) => void;
  onToolbarSelectionChange: (
    visualizerId: string,
    index: any,
    event: any
  ) => void;
}) {
  const {
    viewer3D,
    toolbar,
    onToolbarButtonClick,
    onToolbarSelectionChange
  } = props;

  return (
    <div className="visualizer">
      <VisualizerToolbar
        visualizerId="3D"
        toolbar={toolbar}
        onToolbarButtonClick={onToolbarButtonClick}
        onToolbarSelectionChange={onToolbarSelectionChange}
      />
      <div ref={viewer3D} id="visualizer-3d" className="visualizer-3d" />
    </div>
  );
}
