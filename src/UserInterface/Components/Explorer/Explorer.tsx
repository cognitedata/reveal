import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { TreeDataItemState } from "@/UserInterface/Redux/State/explorer";
import { getVisibleNodes } from "@/UserInterface/Redux/selectors/explorer";
import { ITreeNode, VirtualTree } from "@cognite/subsurface-components";
import ExplorerNodeUtils from "@/UserInterface/NodeVisualizer/Explorer/ExplorerNodeUtils";
import NodeTabs from "./NodeTabs";

// Get a copy of nodes
function getCopyOfNodes(nodes?: {
  [key: string]: TreeDataItemState;
}): { [key: string]: ITreeNode } {
  const nodesCopy: { [key: string]: ITreeNode } = {};
  if (nodes) {
    for (const id in nodes) {
      if (nodes.hasOwnProperty(id)) {
        nodesCopy[id] = {
          ...nodes[id],
          children: [],
        };
      }
    }
  }
  return nodesCopy;
}

// Generate tree data structure
function generateTree(nodes?: { [key: string]: TreeDataItemState }) {
  const data: ITreeNode[] = [];
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
    ExplorerNodeUtils.viewNodeById(uniqueId);
  };

  // Handle Node Expand
  const handleToggleNodeExpand = (uniqueId: string, expandState: boolean) => {
    ExplorerNodeUtils.expandNodeById(uniqueId);
  };

  // Handle Node Select
  const handleToggleNodeSelect = (uniqueId: string, selectState: boolean) => {
    ExplorerNodeUtils.selectNodeById(uniqueId, selectState);
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
