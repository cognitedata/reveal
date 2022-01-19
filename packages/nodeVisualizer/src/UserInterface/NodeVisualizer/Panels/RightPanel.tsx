import React from 'react';
import { ConnectedViewer3D } from '@/UserInterface/NodeVisualizer/Viewers/ConnectedViewer3D';
import { VisualizerToolbarProps } from '@/UserInterface/NodeVisualizer/ToolBar/VisualizerToolbar';
import styled from 'styled-components';
import { panelBackground } from '@/UserInterface/styles/styled.props';

interface RightPanelProps {
  viewer3D: React.RefCallback<HTMLElement>;
  toolbar: React.ComponentType<VisualizerToolbarProps>;
}

/**
 * Right Panel - 3D/2D viewers
 */
export const RightPanel = ({ viewer3D, toolbar }: RightPanelProps) => {
  return (
    <RightPanelContent>
      <ConnectedViewer3D viewer3D={viewer3D} toolbar={toolbar} />
    </RightPanelContent>
  );
};

const RightPanelContent = styled.div`
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: var(--node-viz-background, ${panelBackground});
`;
