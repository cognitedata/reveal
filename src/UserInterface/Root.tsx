import "reset-css";
import "./styles/css/index.css";
import "./styles/css/react-split-pane.css";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SplitPane from "react-split-pane";

import RightPanel from "./components/Panels/RightPanel";
import LeftPanel from "./components/Panels/LeftPanel";

import RootManager from "./managers/rootManager";
import { generateNodeTree, viewAllNodes } from "./redux/actions/explorer";
import { BaseRootLoader } from '@/RootLoaders/BaseRootLoader';
import { RandomDataLoader } from '@/RootLoaders/RandomDataLoader';
import { ReduxStore } from './interfaces/common';

/**
 * Root component
 */
export default () => {

  const dispatch = useDispatch();
  const explorer = useSelector((state: ReduxStore) => state.explorer);

  const root = explorer.root;

  useEffect(() => {
    RootManager.addTargets(root);
    RootManager.initializeWhenPopulated(root);
    const loader: BaseRootLoader = new RandomDataLoader();
    loader.load(root);
  }, [root]);

  // Generate node tree
  useEffect(() => {
    dispatch(generateNodeTree({ root }));
  }, [root.childCount]);

  // Initialy show all nodes
  // useEffect(() => {
  //   if (explorer.nodes) {
  //     dispatch(viewAllNodes({ root }));
  //   }
  // }, [explorer.nodes && Object.keys(explorer.nodes).length]);

  return (
    <div className="root-container">
      <SplitPane split="vertical" defaultSize={1200} primary="second">
        <LeftPanel />
        <RightPanel />
      </SplitPane>
    </div>
  );
};
