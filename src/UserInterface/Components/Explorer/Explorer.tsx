import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { TreeDataItemState } from "@/UserInterface/Redux/State/explorer";
import {
  onToggleNodeSelect,
  onToggleNodeExpand,
  onToggleNodeCheck
} from "@/UserInterface/Redux/actions/explorer";
import NodeTabs from "./NodeTabs";
import { getVisibleNodes } from "@/UserInterface/Redux/selectors/explorer";
import { TreeNode, VirtualTree } from "@cognite/subsurface-components";

// Get a copy of nodes
function getCopyOfNodes(nodes?: { [key: string]: TreeDataItemState }): { [key: string]: TreeNode } {
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
function generateTree(nodes?: { [key: string]: TreeDataItemState }) {
  const data: TreeNode[] = [];
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
  const dispatch = useDispatch();

  const nodes = useSelector(getVisibleNodes);
  const data = generateTree(nodes);

  // Handle Node Check
  const handleToggleNodeCheck = (uniqueId: string, checkState: boolean) => {
    dispatch(onToggleNodeCheck({ uniqueId, checkState }));
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
        onToggleNodeSelect={handleToggleNodeSelect}
        onToggleNodeExpand={handleToggleNodeExpand}
        onToggleNodeCheck={handleToggleNodeCheck}
      />
      <NodeTabs />
    </div>
  );
}
