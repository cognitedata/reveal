import React from "react";
import SplitPane from "react-split-pane";
import Settings from "@/UserInterface/Components/Settings/Settings";
import {Explorer} from "@/UserInterface/Components/Explorer/Explorer";

// Renders Explorer and Settings Components
export default function LeftPanel() {
  return (
    <div className="left-panel">
      <SplitPane split="horizontal" defaultSize={"50%"} primary="second">
        <Explorer />
        <Settings />
      </SplitPane>
    </div>
  );
}
