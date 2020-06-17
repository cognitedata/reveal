import { createReducer } from "@reduxjs/toolkit";
import
{
  ExplorerStateInterface,
  TreeDataItem,
} from "@/UserInterface/interfaces/explorer";
import dummyExplorerState from "@/UserInterface/data/explorer-dummy-state";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import Nodes from "@/UserInterface/constants/Nodes";
import RootManager from "@/UserInterface/managers/rootManager";
import { CheckBoxState } from '@/Core/Enums/CheckBoxState';
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";

// Generate redux store compatible nodes data structure from root node
function generateNodeStructure(
  uniqueId: string,
  parentId: string | null,
  type: string,
  node: BaseNode
): TreeDataItem
{
  return {
    parentId,
    uniqueId,
    name: node.getName(),
    expanded: (node.isExpanded),
    type,
    icon: {
      path: node.getIcon(),
      description: node.getName(),
      color: (node.hasIconColor() ? node.getColor() : undefined)
    },
    selected: node.IsSelected(),
    checked: (node.getCheckBoxState() === CheckBoxState.All),
    indeterminate: (node.getCheckBoxState() === CheckBoxState.Some),
    isRadio: (node.isRadio(null)),
    isFilter: node.isFilter(null),
    disabled: (node.getCheckBoxState() === CheckBoxState.Disabled),
    visible: node.isVisibleInTreeControl(),
    label: {
      italic: node.isLabelInItalic(),
      bold: node.isLabelInBold(),
      color: node.getLabelColor(),
    },
    domainObject: node,
  };
}

// Generate redux store compatible nodes data from root node
function makeNodes(root: BaseRootNode)
{
  const rootId = root.uniqueId.toString();
  const nodes: { [key: string]: any } = {};
  let queue: BaseNode[] = [root.children[1]];
  let node;
  while (queue.length)
  {
    node = queue.shift();
    if (node)
    {
      const uniqueId = node.uniqueId.toString();
      const parentId = node.parent ? node.parent.uniqueId.toString() : null;
      nodes[uniqueId] = generateNodeStructure(
        uniqueId,
        parentId === rootId ? null : parentId,
        Nodes.NODE_TYPES.WELLS,
        node
      );
      if (node.childCount)
      {
        queue.push(...node.children);
      }
    }
  }
  queue = [root.children[2]];
  while (queue.length)
  {
    node = queue.shift();
    if (node)
    {
      const uniqueId = node.uniqueId.toString();
      const parentId = node.parent ? node.parent.uniqueId.toString() : null;
      nodes[uniqueId] = generateNodeStructure(
        uniqueId,
        parentId === rootId ? null : parentId,
        Nodes.NODE_TYPES.OTHERS,
        node
      );
      if (node.childCount)
      {
        queue.push(...node.children);
      }
    }
  }
  return nodes;
}

const initialState: ExplorerStateInterface = {
  ...dummyExplorerState,
  root: RootManager.createRoot(),
  selectedNodeType: { value: 0, name: Nodes.NODE_TYPES.OTHERS },
  selectedNode: null,
  checkedNodeIds: new Set<string>(),
};

// Redux Toolkit package includes a createReducer utility that uses Immer internally.
// Because of this, we can write reducers that appear to "mutate" state, but the updates
// are actually applied immutably.
export default createReducer(initialState, {
  GENERATE_NODE_TREE: (state, action) =>
  {
    const { root } = action.payload;
    state.nodes = makeNodes(root);
  },
  TOGGLE_NODE_SELECT: (state, action) =>
  {
    const { uniqueId, selectState } = action.payload;
    state.nodes![uniqueId].selected = selectState;
    if (selectState)
    {
      if (state.selectedNode) state.nodes![state.selectedNode].selected = false;
      state.selectedNode = uniqueId;
    }
  },
  TOGGLE_NODE_EXPAND: (state, action) =>
  {
    const { uniqueId, expandState } = action.payload;
    state.nodes![uniqueId].expanded = expandState;
  },
  CHANGE_CHECKBOX_STATE: (state, action) =>
  {
    const uniqueId = action.appliesTo;
    const treeNodeState = state.nodes![uniqueId];
    if (treeNodeState === undefined) return; //TODO: When could this happen?
    const checkNode = state.nodes![uniqueId];
    switch (action.payload)
    {
      case 'checked':
        checkNode.checked = true;
        checkNode.indeterminate = false;
        checkNode.disabled = false;
        // tslint:disable-next-line:no-console
        console.log('changed state of ', checkNode.name, ' to checked');
        state.checkedNodeIds.add(uniqueId);
        break;
      case 'unchecked':
        checkNode.checked = false;
        checkNode.indeterminate = false;
        checkNode.disabled = false;
        // tslint:disable-next-line:no-console
        console.log('changed state of ', checkNode.name, ' to un-checked');
        break;
      case 'disabled':
        checkNode.checked = false;
        checkNode.indeterminate = false;
        checkNode.disabled = true;
        // tslint:disable-next-line:no-console
        console.log('changed state of ', checkNode.name, ' to un-checked');
        break;
      case 'partial':
        checkNode.indeterminate = true;
        checkNode.checked = false;
        checkNode.disabled = false;
        // tslint:disable-next-line:no-console
        console.log('changed state of ', checkNode.name, ' to partial');
        break;
      default:
      // do nothing
    }
  },
  VIEW_ALL_NODES_SUCCESS: (state, action) =>
  {
    const nodes = state.nodes;
    for (const id in nodes)
    {
      if (nodes.hasOwnProperty(id))
      {
        nodes[id].checked = true;
      }
    }
  },
  CHANGE_NODE_TYPE: (state, action) =>
  {
    const { nodeTypeIndex, nodeType } = action.payload;
    state.selectedNodeType = { value: nodeTypeIndex, name: nodeType };
  },
});
