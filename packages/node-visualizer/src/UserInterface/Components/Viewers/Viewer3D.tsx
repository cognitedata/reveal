import React from 'react';

import styled from 'styled-components';

import {
  ToolbarConfig,
  VisualizerToolbarProps,
} from '../../../UserInterface/NodeVisualizer/ToolBar/VisualizerToolbar';
import { statusBarHeight } from '../../../UserInterface/styles/styled.props';

export interface Viewer3DProps {
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
  viewInfoBar: boolean;
}

// 3D Viewer
export const Viewer3D = (props: Viewer3DProps) => {
  const {
    viewer3D,
    toolbar: Toolbar,
    toolbarConfig,
    onToolbarButtonClick,
    onToolbarSelectionChange,
    viewInfoBar,
  } = props;

  return (
    <VisualizerWrapper viewInfoBar={viewInfoBar}>
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

const VisualizerWrapper = styled.div<{
  viewInfoBar: boolean;
}>`
  width: 100%;
  height: calc(
    100% - ${(props) => (props.viewInfoBar ? '40px' : statusBarHeight)}
  );
`;

const Visualizer3D = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  canvas {
    width: 100% !important;
    height: 100% !important;
    min-width: 100%;
  }
`;
