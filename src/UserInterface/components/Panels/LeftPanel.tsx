import React from "react";
import { Explorer } from "../Explorer/Explorer";
import SplitPane from "react-split-pane";
import Settings from "@/UserInterface/components/Settings/Settings";

// Renders Explorer and Settings components
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
