// import '../styles/scss/react-split-pane.scss';

import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SplitPane from 'react-split-pane';

import styled from 'styled-components';

import { Modules } from '../../Core/Module/Modules';
import { BaseRootNode } from '../../Core/Nodes/BaseRootNode';
import { Appearance } from '../../Core/States/Appearance';
import { ThreeDUnits } from '../../Core/Primitives/Units';
import { VirtualUserInterface } from '../../Core/States/VirtualUserInterface';
import { NotificationsToActionsAdaptor } from '../Adapters/NotificationToAction';
import { UserInterfaceListener } from '../Adapters/UserInterfaceListener';
import { Explorer } from '../Components/Explorer/Explorer';
import { ExplorerPropType } from '../Components/Explorer/ExplorerTypes';
import { Viewer } from '../Components/Viewers/Viewer';
import { generateNodeTree } from '../Redux/reducers/ExplorerReducer';
import { initializeToolbarStatus } from '../Redux/reducers/VisualizersReducer';
import { State } from '../Redux/State/State';

import { LeftPanel } from './Panels/LeftPanel';
import { RightPanel } from './Panels/RightPanel';
import { Toolbar } from './ToolBar/Toolbar';
import {
  VisualizerToolbar,
  VisualizerToolbarProps,
} from './ToolBar/VisualizerToolbar';
import { ViewerUtils } from './Viewers/ViewerUtils';

export interface NodeVisualizerProps {
  /**
   * root node
   */
  root?: BaseRootNode;
  /**
   * explorer render prop - uses for customisation of node tree explorer
   */
  explorer?: React.ComponentType<ExplorerPropType>;
  /**
   * toolbar render prop - uses for customisation of visualizer toolbar
   */
  toolbar?: React.ComponentType<VisualizerToolbarProps>;
  unit: ThreeDUnits;
}

/**
 * Node Visualizer Component of the application
 * This will render all the Components (Settings/Explorer/3D viewers etc.)
 */

const CustomSplitPane: any = SplitPane;

export const NodeVisualizer: React.FC<NodeVisualizerProps> = (props) => {
  const dispatch = useDispatch();
  const common = useSelector((state: State) => state.common); // -TODO: Remove state reference
  const { root, explorer, toolbar, unit } = props;

  if (root) {
    BaseRootNode.active = root;
  }

  // success callback for registering viewers to DOM
  const viewerElementCallback = useCallback(
    (element: HTMLElement) => {
      if (!element || !root) return;

      // clear Node
      // eslint-disable-next-line no-param-reassign
      element.innerHTML = '';

      // Add new viewers here Eg - new Viewer("2D", htmlElement2D)
      ViewerUtils.addViewer('3D', new Viewer('3D', element));
      // Add targets and toolbars to root node
      const viewers = Object.values(ViewerUtils.getViewers());

      viewers.forEach((viewer) => {
        // eslint-disable-next-line testing-library/render-result-naming-convention
        const targetNode = Modules.instance.createRenderTargetNode();
        if (!targetNode) return;

        const toolbarTools = new Toolbar();

        targetNode.addTools(toolbarTools);
        targetNode.setName(viewer.getName());
        targetNode.setUnit(unit);
        viewer.setTarget(targetNode);
        viewer.setToolbarCommands(toolbarTools);
        root.targets.addChild(targetNode);
        element.appendChild(targetNode.domElement);
        targetNode.setActiveInteractive();
      });

      Modules.instance.initializeWhenPopulated(root);

      const notificationAdaptor = new NotificationsToActionsAdaptor(dispatch);

      VirtualUserInterface.install(
        new UserInterfaceListener(notificationAdaptor, dispatch)
      );

      // Add target and toolbar data to state
      dispatch(initializeToolbarStatus());
      dispatch(generateNodeTree());
    },
    [root, unit]
  );

  const renderExplorer = useMemo(
    () =>
      explorer ||
      ((explorerProps: ExplorerPropType) => <Explorer {...explorerProps} />),
    [explorer]
  );

  const renderToolbar = useMemo(
    () =>
      toolbar ||
      ((toolbarProps: VisualizerToolbarProps) => (
        <VisualizerToolbar {...toolbarProps} />
      )),
    [toolbar]
  );

  return (
    <NodeVisualizerContainer>
      <CustomSplitPane
        split="vertical"
        minSize={common.isFullscreen ? 0 : Appearance.leftPanelDefaultSize}
        maxSize={common.isFullscreen ? 0 : Appearance.leftPanelMaxSize}
        pane2Style={{ overflow: 'hidden' }}
        onChange={() => {
          // -TODO: Test this feature on BP
          const viewers = Object.values(ViewerUtils.getViewers());

          viewers.forEach((viewer) => {
            viewer.getTarget()?.onResize();
          });
        }}
      >
        <LeftPanel explorer={renderExplorer} custom={!!explorer} />
        <RightPanel viewer3D={viewerElementCallback} toolbar={renderToolbar} />
      </CustomSplitPane>
    </NodeVisualizerContainer>
  );
};

const NodeVisualizerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  font-family: 'Roboto', sans-serif;
  overflow: hidden;

  div {
    outline: none;
  }
`;
