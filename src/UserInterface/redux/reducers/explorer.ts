import { createReducer } from "@reduxjs/toolkit";

import {
  ExplorerStateInterface,
  TreeDataItem,
} from "../../interfaces/explorer";
import { state as dummyState } from "@/UserInterface/data/explorer-dummy-state";
import { RootNode } from "@/Nodes/TreeNodes/RootNode";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import Nodes from "@/UserInterface/constants/Nodes";
import RootManager from "@/UserInterface/managers/rootManager";

// Generate redux store compatible nodes data structure from root node
function generateNodeStructure(
  uniqueId: string,
  parentId: string | null,
  type: string,
  node: BaseNode
): TreeDataItem {
  return {
    parentId,
    id: uniqueId,
    name: node.name,
    expanded: false,
    type,
    icon: "ba8c2cf8d98eff705cf9c4d3236cda9a.png",
    iconDescription: "nodes",
    selected: false,
    checked: false,
    indeterminate: false,
    isRadio: false,
    isFilter: false,
    disabled: false,
    visible: false,
    uniqueId,
    domainObject: node,
  };
}

// Generate redux store compatible nodes data from root node
function makeNodes(root: RootNode) {
  const rootId = root.uniqueId.toString();
  const nodes: { [key: string]: any } = {};
  let queue: BaseNode[] = [root.children[1]];
  let node;
  while (queue.length) {
    node = queue.shift();
    if (node) {
      const uniqueId = node.uniqueId.toString();
      const parentId = node.parent ? node.parent.uniqueId.toString() : null;
      nodes[uniqueId] = generateNodeStructure(
        uniqueId,
        parentId === rootId ? null : parentId,
        Nodes.NODE_TYPES.WELLS,
        node
      );
      if (node.childCount) {
        queue.push(...node.children);
      }
    }
  }
  queue = [root.children[2]];
  while (queue.length) {
    node = queue.shift();
    if (node) {
      const uniqueId = node.uniqueId.toString();
      const parentId = node.parent ? node.parent.uniqueId.toString() : null;
      nodes[uniqueId] = generateNodeStructure(
        uniqueId,
        parentId === rootId ? null : parentId,
        Nodes.NODE_TYPES.OTHERS,
        node
      );
      if (node.childCount) {
        queue.push(...node.children);
      }
    }
  }
  return nodes;
}

const initialState: ExplorerStateInterface = {
  ...dummyState,
  root: RootManager.createRoot(),
  selectedNodeType: { value: 0, name: Nodes.NODE_TYPES.OTHERS },
  selectedNode: null,
  checkedNodeIds: new Set<string>(),
};

// Redux Toolkit package includes a createReducer utility that uses Immer internally.
// Because of this, we can write reducers that appear to "mutate" state, but the updates
// are actually applied immutably.
export default createReducer(initialState, {
  GENERATE_NODE_TREE: (state, action) => {
    const { root } = action.payload;
    const nodes = makeNodes(root);
    state.nodes = nodes;
  },
  TOGGLE_NODE_SELECT: (state, action) => {
    const { uniqueId, selectState } = action.payload;
    state.nodes![uniqueId].selected = selectState;
    if (selectState) {
      if (state.selectedNode) state.nodes![state.selectedNode].selected = false;
      state.selectedNode = uniqueId;
    }
  },
  TOGGLE_NODE_EXPAND: (state, action) => {
    const { uniqueId, expandState } = action.payload;
    state.nodes![uniqueId].expanded = expandState;
  },
  TOGGLE_NODE_CHECK_SUCCESS: (state, action) => {
    const { uniqueId, checkState } = action.payload;
    state.nodes![uniqueId].checked = checkState;
    if (checkState) state.checkedNodeIds.add(uniqueId);
  },
  VIEW_ALL_NODES_SUCCESS: (state, action) => {
    const nodes = state.nodes;
    for (const id in nodes) {
      if(nodes.hasOwnProperty(id)){
          nodes[id].checked = true;
      }
    }
  },
  CHANGE_NODE_TYPE: (state, action) => {
    const { nodeTypeIndex, nodeType } = action.payload;
    state.selectedNodeType = { value: nodeTypeIndex, name: nodeType };
  },
});
