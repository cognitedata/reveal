import "reset-css";
import "./styles/css/index.css";
import "./styles/css/react-split-pane.css";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SplitPane from "react-split-pane";
import _ from "lodash";

import RightPanel from "./components/Panels/RightPanel";
import LeftPanel from "./components/Panels/LeftPanel";

import RootManager from "./managers/rootManager";
import { generateNodeTree } from "./redux/actions/explorer";
import { BaseRootLoader } from "@/RootLoaders/BaseRootLoader";
import { RandomDataLoader } from "@/RootLoaders/RandomDataLoader";
import { ReduxStore } from "./interfaces/common";
import { setVisualizerToolbars } from "./redux/actions/visualizers";

import NotificationsToActionsAdaptor from "./adaptors/NotificationToAction";
import { VirtualUserInterface } from "@/Core/States/VirtualUserInterface";
import UserInterfaceListener from "./adaptors/UserInterfaceListener";

/**
 * Root component
 */
export default () => {
  const dispatch = useDispatch();
  const explorer = useSelector((state: ReduxStore) => state.explorer);
  const root = explorer.root;

  // Setup root and generate domain nodes
  useEffect(() => {
    const notificationAdaptor: NotificationsToActionsAdaptor = new NotificationsToActionsAdaptor(
      dispatch
    );
    VirtualUserInterface.install(
      new UserInterfaceListener(notificationAdaptor)
    );

    RootManager.addTargets(root, (viewerToolBar) => dispatch(setVisualizerToolbars(viewerToolBar)));
    RootManager.appendDOM(root, "visualizer-3d", "3d");

    const loader: BaseRootLoader = new RandomDataLoader();
    loader.load(root);
    dispatch(generateNodeTree({ root }));
    RootManager.initializeWhenPopulated(root);
  }, [root]);

  return (
    <div className="root-container">
      <SplitPane split="vertical" defaultSize={1200} primary="second">
        <LeftPanel />
        <RightPanel />
      </SplitPane>
    </div>
  );
};
