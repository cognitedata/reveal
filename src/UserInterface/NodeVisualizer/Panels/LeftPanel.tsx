import React, { useMemo } from "react";
import { ExplorerPropType } from "@/UserInterface/Components/Explorer/ExplorerTypes";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  getAllTabs,
  getCurrentTabIndex,
  getNodeTree,
  onSelectedTabChange,
} from "@/UserInterface/Redux/reducers/ExplorerReducer";
import { ExplorerNodeUtils } from "@/UserInterface/NodeVisualizer/Explorer/ExplorerNodeUtils";
import { onSelectedNodeChange } from "@/UserInterface/Redux/reducers/SettingsReducer";
import { State } from "@/UserInterface/Redux/State/State";

function mapDispatchToExplorerPanel(dispatch: Dispatch) {
  return {
    onTabChange: (tabIndex: number): void => {
      dispatch(onSelectedTabChange({ selectedTabIndex: tabIndex }));
      const currentSelectedNode = ExplorerNodeUtils.getSelectedNodeOfCurrentTab(
        tabIndex
      );
      if (currentSelectedNode)
        dispatch(onSelectedNodeChange(currentSelectedNode));
    },
    onNodeExpandToggle: (nodeId: string, expandState: boolean): void => {
      ExplorerNodeUtils.setNodeExpandById(nodeId, expandState);
    },
    onToggleVisible: (nodeId: string): void => {
      ExplorerNodeUtils.toggleVisibleById(nodeId);
    },
    onNodeSelect: (nodeId: string, selectState: boolean): void => {
      ExplorerNodeUtils.selectNodeById(nodeId, selectState);
    },
  };
}

function mapStateToExplorerPanel(state: State) {
  const tabs = getAllTabs(state);
  const data = getNodeTree(state);
  const selectedTabIndex = getCurrentTabIndex(state);

  return { tabs, data, selectedTabIndex };
}

// Renders Explorer
export function LeftPanel({
  explorer,
}: {
  explorer: React.ComponentType<ExplorerPropType>;
}) {
  const Explorer = useMemo(
    () =>
      connect(mapStateToExplorerPanel, mapDispatchToExplorerPanel)(explorer),
    []
  );

  return (
    <div className="left-panel">
      <Explorer />
    </div>
  );
}
