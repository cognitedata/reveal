import React from 'react';
import SplitPane from "react-split-pane";

import Explorer from '../Explorer';
import Settings from "../Settings/Settings";

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
