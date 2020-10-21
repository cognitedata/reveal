import React from "react";
import {
  ToolbarConfig,
  VisualizerToolbarProps,
} from "@/UserInterface/NodeVisualizer/ToolBar/VisualizerToolbar";

// 3D Viewer
export function Viewer3D(props: {
  viewer3D: React.RefCallback<HTMLElement>;
  toolbar: React.ComponentType<VisualizerToolbarProps>;
  toolbarConfig?: ToolbarConfig;
  onToolbarButtonClick: (
    visualizerId: string,
    groupId: string,
    index: number
  ) => void;
  onToolbarSelectionChange: (
    visualizerId: string,
    groupId: string,
    index: number,
    value: string
  ) => void;
}) {
  const {
    viewer3D,
    toolbar: Toolbar,
    toolbarConfig,
    onToolbarButtonClick,
    onToolbarSelectionChange,
  } = props;

  return (
    <div className="visualizer">
      <Toolbar
        visualizerId="3D"
        config={toolbarConfig}
        onToolbarButtonClick={onToolbarButtonClick}
        onToolbarSelectionChange={onToolbarSelectionChange}
      />
      <div ref={viewer3D} id="visualizer-3d" className="visualizer-3d" />
    </div>
  );
}
