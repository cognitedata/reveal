import React from 'react';

import RightPanel from "./panels/RightPanel";
import LeftPanel from "./panels/LeftPanel";
import Root from "../Root";
import SplitPane from "react-split-pane";

export default function SubsurfaceVisualizer() {
  return (
    <Root>
      <div className="root-container">
        <SplitPane
          split="vertical"
          defaultSize={1200}
          primary="second">
          <LeftPanel />
          <RightPanel />
        </SplitPane>
      </div>
    </Root>
  );
}
