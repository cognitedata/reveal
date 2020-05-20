import React from 'react';

import RightPanel from "./components/Panels/RightPanel";
import LeftPanel from "./components/Panels/LeftPanel";
import Root from "./Root";
import SplitPane from "react-split-pane";

/**
 * Subsurface Visualizer Component of the application
 * This will render all the components (Settings/Explorer/3D viewers etc.)
 */
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
