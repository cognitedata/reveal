import React from 'react';
import Explorer from '../components/Explorer';
import Settings from "../components/Settings/Settings";
import SplitPane from "react-split-pane";

export default function LeftPanel() {
  return (<div className="left-panel">
    <SplitPane
      split="horizontal"
      defaultSize={"50%"}
      primary="second">
      <Explorer />
      <Settings />
    </SplitPane>
  </div>
  );
}
