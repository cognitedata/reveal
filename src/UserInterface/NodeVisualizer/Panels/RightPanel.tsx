import React from 'react';
import { ConnectedViewer3D } from '@/UserInterface/NodeVisualizer/Viewers/ConnectedViewer3D';
import { VisualizerToolbarProps } from '@/UserInterface/NodeVisualizer/ToolBar/VisualizerToolbar';

interface RightPanelProps {
  viewer3D: React.RefCallback<HTMLElement>;
  toolbar: React.ComponentType<VisualizerToolbarProps>;
}

/**
 * Right Panel - 3D/2D viewers
 */
export const RightPanel = ({ viewer3D, toolbar }: RightPanelProps) => {
  return (
    <div className="right-panel">
      <ConnectedViewer3D viewer3D={viewer3D} toolbar={toolbar} />
    </div>
  );
};
