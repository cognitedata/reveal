import "reset-css";
import "./styles/css/index.css";
import "./styles/css/react-split-pane.css";
import React from "react";
import SplitPane from "react-split-pane";
import RightPanel from "./components/Panels/RightPanel";
import LeftPanel from "./components/Panels/LeftPanel";

/**
 * Root component
 */
export default () => {
  return (
    <div className="root-container">
      <SplitPane split="vertical" defaultSize={1200} primary="second">
        <LeftPanel />
        <RightPanel />
      </SplitPane>
    </div>
  );
};
