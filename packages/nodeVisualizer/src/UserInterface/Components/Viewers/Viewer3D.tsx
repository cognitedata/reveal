import React from 'react';
import {
  ToolbarConfig,
  VisualizerToolbarProps,
} from '@/UserInterface/NodeVisualizer/ToolBar/VisualizerToolbar';
import styled from 'styled-components';
import { statusBarHeight } from '@/UserInterface/styles/styled.props';

interface Viewer3DProps {
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
}

// 3D Viewer
export const Viewer3D = (props: Viewer3DProps) => {
  const {
    viewer3D,
    toolbar: Toolbar,
    toolbarConfig,
    onToolbarButtonClick,
    onToolbarSelectionChange,
  } = props;

  return (
    <VisualizerWrapper>
      <Toolbar
        visualizerId="3D"
        config={toolbarConfig}
        onToolbarButtonClick={onToolbarButtonClick}
        onToolbarSelectionChange={onToolbarSelectionChange}
      />
      <Visualizer3D ref={viewer3D} id="visualizer-3d" />
    </VisualizerWrapper>
  );
};

const VisualizerWrapper = styled.div`
  width: 100%;
  height: calc(100% - ${statusBarHeight});
`;

const Visualizer3D = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  canvas {
    width: 100%;
    height: 100%;
    min-width: 100%;
  }
`;
