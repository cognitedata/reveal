import React from "react";
import SplitPane from "react-split-pane";
import { ConnectedSettingsPanel } from "@/UserInterface/NodeVisualizer/Settings/ConnectedSettingsPanel";
import { ConnectedExplorerPanel } from "@/UserInterface/NodeVisualizer/Explorer/ConnectedExplorerPanel";

// Renders Explorer and Settings Components
export default function LeftPanel() {
  return (
    <div className="left-panel">
      <SplitPane split="horizontal" defaultSize={"50%"} primary="second">
        <ConnectedExplorerPanel />
        <ConnectedSettingsPanel />
      </SplitPane>
    </div>
  );
}
