import React from "react";
import { VirtualTree } from "@cognite/subsurface-components";
import { ExplorerPropType } from "@/UserInterface/Components/Explorer/ExplorerTypes";
import { ExplorerTabs } from "@/UserInterface/Components/Explorer/ExplorerTabs";

// Renders Tree Controller
export function Explorer(props: ExplorerPropType) {
  // Handle Node Check
  const handleToggleNodeCheck = (uniqueId: string, checked: boolean) => {
    props.onNodeVisibilityChange(uniqueId, checked);
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
        onToggleNodeCheck={handleToggleNodeCheck}
      />
      <ExplorerTabs
        tabs={props.tabs}
        selectedTabIndex={props.selectedTabIndex}
        onTabChange={props.onTabChange}
      />
    </div>
  );
}
