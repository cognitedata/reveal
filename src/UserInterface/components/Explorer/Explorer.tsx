import React from "react";
import { useSelector, useDispatch } from "react-redux";

import VirtualTree from "./VirtualTree";
import { ReduxStore } from "../../interfaces/common"
import { TreeDataItem, TreeNode } from "@/UserInterface/interfaces/explorer";
import {
  onToggleNodeSelect,
  onToggleNodeExpand,
  onToggleNodeCheck
} from "../../redux/actions/explorer";

// Get a copy of nodes
function getCopyOfNodes(nodes?: {
  [key: string]: TreeDataItem
}): { [key: string]: TreeNode } {
  const nodesCopy: { [key: string]: TreeNode } = {};
  if (nodes) {
    for (const id in nodes) {
      nodesCopy[id] = { ...nodes[id], children: [] }
    }
  }
  return nodesCopy;
}

// Generate tree data structure
function generateTree(nodes?: {
  [key: string]: TreeDataItem
}) {
  const data = [];
  if (nodes) {
    const nodesCopy = getCopyOfNodes(nodes);
    for (const id in nodesCopy) {
      const node = nodesCopy[id];
      if (node.parentId) {
        const parent = nodesCopy[node.parentId];
        if (parent.children) {
          parent.children.push(node);
        } else {
          parent.children = [node];
        }
      } else {
        data.push(node)
      }
    }
  }
  return data;
}

// Renders Tree Controller
export function Explorer() {

  const dispatch = useDispatch();

  const explorer = useSelector((state: ReduxStore) => state.explorer);
  const { nodes } = explorer;
  const data = generateTree(nodes);

  // Handle Node Check
  const handleToggleNodeCheck = (
    uniqueId: string,
    checkState: boolean) => {
    dispatch(onToggleNodeCheck({ uniqueId, checkState }))
  };

  // Handle Node Expand
  const handleToggleNodeExpand = (
    uniqueId: string,
    expandState: boolean) => {
    dispatch(onToggleNodeExpand({ uniqueId, expandState }));
  };

  // Handle Node Select
  const handleToggleNodeSelect = (
    uniqueId: string,
    selectState: boolean) => {
    dispatch(onToggleNodeSelect({ uniqueId, selectState }))
  };


  return (
    <div className="explorer explorer-container">
      <VirtualTree
        data={data}
        onToggleNodeSelect={handleToggleNodeSelect}
        onToggleNodeExpand={handleToggleNodeExpand}
        onToggleNodeCheck={handleToggleNodeCheck}
      />
    </div>
  );
}
