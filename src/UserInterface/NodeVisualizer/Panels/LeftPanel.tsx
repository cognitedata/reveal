import React from "react";
import SplitPane from "react-split-pane";
import { ConnectedSettingsPanel } from "@/UserInterface/NodeVisualizer/Settings/ConnectedSettingsPanel";
import { Explorer } from "@/UserInterface/Components/Explorer/Explorer";

// Renders Explorer and Settings Components
export default function LeftPanel() {
  return (
    <div className="left-panel">
      <SplitPane split="horizontal" defaultSize={"50%"} primary="second">
        <Explorer />
        <ConnectedSettingsPanel />
      </SplitPane>
    </div>
  );
}
