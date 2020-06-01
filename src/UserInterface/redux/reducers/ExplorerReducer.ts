import { createReducer } from "@reduxjs/toolkit";
import {
  ExplorerStateInterface,
  TreeDataItem,
} from "@/UserInterface/interfaces/explorer";
import { state as dummyState } from "@/UserInterface/data/explorer-dummy-state";
import { RootNode } from "@/Nodes/TreeNodes/RootNode";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import Nodes from "@/UserInterface/constants/Nodes";
import RootManager from "@/UserInterface/managers/rootManager";
import { BaseTreeNode } from '@/Core/Nodes/BaseTreeNode';
import { CheckBoxState } from '@/Core/Enums/CheckBoxState';

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
    expanded: (node.isExpanded),
    type,
    icon: node.icon,
    iconDescription: "nodes",
    iconVisible: ((node instanceof BaseTreeNode)? false: true),
    selected: node.isActive,
    checked: (node.getCheckBoxState() === CheckBoxState.All),
    indeterminate: (node.getCheckBoxState() === CheckBoxState.Some),
    isRadio: (node.isRadio(null)),
    isFilter: node.isFilter(null),
    disabled: (!node.canBeChecked(null)),
    visible: node.isVisibleInTreeControl,
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
    state.nodes = makeNodes(root);
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
  CHANGE_CHECKBOX_STATE: (state, action) => {
    const uniqueId = action.appliesTo;
    const treeNodeState = state.nodes![uniqueId];
    if(treeNodeState == undefined) return; //TODO: When could this happen?
    switch(action.payload) {
      case 'checked':
        state.nodes![uniqueId].checked = true;
        console.log('changed state of ', state.nodes![uniqueId].name, ' to checked');
        state.checkedNodeIds.add(uniqueId);
        break;
      case 'unchecked':
        state.nodes![uniqueId].checked = false;
        console.log('changed state of ', state.nodes![uniqueId].name, ' to un-checked');
        break;
      case 'partial':
        state.nodes![uniqueId].checked = true;  //TODO: handle this when tree node state support partial
        console.log('changed state of ', state.nodes![uniqueId].name, ' to partial');
        break;
    }
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
