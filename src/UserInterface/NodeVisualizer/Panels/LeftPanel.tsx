import React from "react";
import { Explorer } from "../../Components/Explorer/Explorer";
import SplitPane from "react-split-pane";
import Settings from "@/UserInterface/Components/Settings/Settings";

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
