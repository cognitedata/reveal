import "@/UserInterface/Components/Explorer/Explorer.module.scss";
import React from "react";
import { ExplorerPropType } from "@/UserInterface/Components/Explorer/ExplorerTypes";
import { ExplorerTabs } from "@/UserInterface/Components/Explorer/ExplorerTabs";
import { VirtualTree } from "@/UserInterface/Components/VirtualTree/VirtualTree"; // todo: get this from @cognite/node-visualizer-components package

// Renders Tree Controller
export function Explorer(props: ExplorerPropType) {
  // Handle Node Check
  const handleToggleVisible = (uniqueId: string) => {
    props.onToggleVisible(uniqueId);
  };

  // Handle Node Expand
  const handleToggleNodeExpand = (uniqueId: string, expandState: boolean) => {
    props.onNodeExpandToggle(uniqueId, expandState);
  };

  // Handle Node Select
  const handleToggleNodeSelect = (uniqueId: string, selectState: boolean) => {
    props.onNodeSelect(uniqueId, selectState);
  };

  return (
    <div className="explorer">
      <VirtualTree
        data={props.data}
        onToggleNodeSelect={handleToggleNodeSelect}
        onToggleNodeExpand={handleToggleNodeExpand}
        onToggleNodeCheck={handleToggleVisible}
      />
      <ExplorerTabs
        tabs={props.tabs}
        selectedTabIndex={props.selectedTabIndex}
        onTabChange={props.onTabChange}
      />
    </div>
  );
}
