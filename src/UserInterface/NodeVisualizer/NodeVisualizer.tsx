import "@/UserInterface/styles/scss/index.scss";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import SplitPane from "react-split-pane";
import RightPanel from "@/UserInterface/NodeVisualizer/Panels/RightPanel";
import LeftPanel from "@/UserInterface/NodeVisualizer/Panels/LeftPanel";
import NotificationsToActionsAdaptor from "@/UserInterface/Adapters/NotificationToAction";
import { VirtualUserInterface } from "@/Core/States/VirtualUserInterface";
import UserInterfaceListener from "@/UserInterface/Adapters/UserInterfaceListener";
import { Modules } from "@/Core/Module/Modules";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import Viewer from "@/UserInterface/Components/Viewers/Viewer";
import Range3 from "@/Core/Geometry/Range3";
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import Toolbar from "@/UserInterface/NodeVisualizer/ToolBar/Toolbar";
import { Appearance } from "@/Core/States/Appearance";
import { State } from "@/UserInterface/Redux/State/State";
import { generateNodeTree } from "@/UserInterface/Redux/reducers/ExplorerReducer";
import { initializeToolbarStatus } from "@/UserInterface/Redux/reducers/VisualizersReducer";
import ViewerUtils from "./Viewers/ViewerUtils";

/**
 * Node Visualizer Component of the application
 * This will render all the Components (Settings/Explorer/3D viewers etc.)
 */
export default function NodeVisualizer(props: { root?: BaseRootNode }) {
  const dispatch = useDispatch();
  const common = useSelector((state: State) => state.common); //TODO: Remove state reference
  const { root } = props;

  if (root) {
    BaseRootNode.active = root;
  }

  // success callback for registering viewers to DOM
  const viewerElementCallback = useCallback(
    (element: HTMLElement) => {
      if (!element || !root) return;

      // clear Node
      element.innerHTML = "";

      // Add new viewers here Eg - new Viewer("2D", htmlElement2D)
      ViewerUtils.addViewer("3D", new Viewer("3D", element));
      // Add targets and toolbars to root node
      for (const viewer of Object.values(ViewerUtils.getViewers())) {
        const target = new ThreeRenderTargetNode(
          Range3.createByMinAndMax(0, 0, 1, 1)
        );
        const toolbar = new Toolbar();

        target.addTools(toolbar);
        target.setName(viewer.getName());
        viewer.setTarget(target);
        viewer.setToolbarCommands(toolbar);
        root.targets.addChild(target);
        element.appendChild(target.domElement);
        target.setActiveInteractive();
      }

      Modules.instance.initializeWhenPopulated(root);

      const notificationAdaptor = new NotificationsToActionsAdaptor(dispatch);

      VirtualUserInterface.install(
        new UserInterfaceListener(notificationAdaptor, dispatch)
      );

      // Add target and toolbar data to state
      dispatch(initializeToolbarStatus());
      dispatch(generateNodeTree());
      console.log("NodeVisualizer: Added toolbars and viewers");
    },
    [root]
  );

  return (
    <div className="node-viz-container">
      <SplitPane
        split="vertical"
        minSize={common.isFullscreen ? 0 : Appearance.leftPanelDefaultSize}
        maxSize={common.isFullscreen ? 0 : Appearance.leftPanelMaxSize}
        onChange={() => {
          // TODO: Test this feature on BP
          for (const viewer of Object.values(ViewerUtils.getViewers())) {
            viewer.getTarget()?.onResize();
          }
        }}
      >
        <LeftPanel />
        <RightPanel viewer3D={viewerElementCallback} />
      </SplitPane>
    </div>
  );
}
