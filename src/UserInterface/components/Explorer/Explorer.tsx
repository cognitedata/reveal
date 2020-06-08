import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { TreeDataItem } from "@/UserInterface/interfaces/explorer";
import {
  onToggleNodeSelect,
  onToggleNodeExpand,
  onToggleNodeCheck
} from "@/UserInterface/redux/actions/explorer";
import NodeTabs from "./NodeTabs";
import { getVisibleNodes } from "@/UserInterface/redux/selectors/explorer";
import { ReduxStore } from "@/UserInterface/interfaces/common";
import { TreeNode, VirtualTree } from "@cognite/subsurface-components";
import { Appearance } from "@/Core/States/Appearance";

// Get a copy of nodes
function getCopyOfNodes(nodes?: { [key: string]: TreeDataItem }): { [key: string]: TreeNode } {
  const nodesCopy: { [key: string]: TreeNode } = {};
  if (nodes) {
    for (const id in nodes) {
      if (nodes.hasOwnProperty(id)) {
        nodesCopy[id] = {
          ...nodes[id],
          children: []
        };
      }
    }
  }
  return nodesCopy;
}

// Generate tree data structure
function generateTree(nodes?: { [key: string]: TreeDataItem }) {
  const data = [];
  if (nodes) {
    const nodesCopy = getCopyOfNodes(nodes);
    for (const id in nodesCopy) {
      if (nodesCopy.hasOwnProperty(id)) {
        const node = nodesCopy[id];
        if (node.parentId) {
          const parent = nodesCopy[node.parentId];
          if (parent.children) {
            parent.children.push(node);
          } else {
            parent.children = [node];
          }
        } else {
          data.push(node);
        }
      }
    }
  }
  return data;
}

// Renders Tree Controller
export function Explorer() {
  const root = useSelector((state: ReduxStore) => state.explorer.root);
  const dispatch = useDispatch();

  const nodes = useSelector(getVisibleNodes);
  const data = generateTree(nodes);

  // Handle Node Check
  const handleToggleNodeCheck = (uniqueId: string, checkState: boolean) => {
    dispatch(onToggleNodeCheck({ uniqueId, checkState, root }));
  };

  // Handle Node Expand
  const handleToggleNodeExpand = (uniqueId: string, expandState: boolean) => {
    dispatch(onToggleNodeExpand({ uniqueId, expandState }));
  };

  // Handle Node Select
  const handleToggleNodeSelect = (uniqueId: string, selectState: boolean) => {
    dispatch(onToggleNodeSelect({ uniqueId, selectState }));
  };

  return (
    <div className="explorer">
      <VirtualTree
        data={data}
        iconSize={Appearance.treeIconSize}
        onToggleNodeSelect={handleToggleNodeSelect}
        onToggleNodeExpand={handleToggleNodeExpand}
        onToggleNodeCheck={handleToggleNodeCheck}
      />
      <NodeTabs />
    </div>
  );
}
