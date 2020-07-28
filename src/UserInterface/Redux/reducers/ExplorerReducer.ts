import {createReducer} from "@reduxjs/toolkit";
import {ExplorerState, TreeDataItemState} from "@/UserInterface/Redux/State/explorer";
import {BaseNode} from "@/Core/Nodes/BaseNode";
import {CheckBoxState} from "@/Core/Enums/CheckBoxState";
import {BaseRootNode} from "@/Core/Nodes/BaseRootNode";
import {
  CHANGE_CHECKBOX_STATE,
  CHANGE_NODE_COLOR,
  CHANGE_NODE_NAME,
  CHANGE_SELECT_STATE,
  CHANGE_SELECTED_TAB,
  GENERATE_NODE_TREE,
  TOGGLE_NODE_EXPAND
} from "@/UserInterface/Redux/actions/actionTypes";

// Generate Redux store compatible nodes data structure from root node
function generateNodeStructure(
  uniqueId: string,
  parentId: string | null,
  node: BaseNode
): TreeDataItemState
{

  const checkBoxState = node.getCheckBoxState();
  return {
    parentId,
    uniqueId,
    name: node.displayName,
    expanded: (node.isExpanded),
    icon: {
      path: node.getIcon(),
      description: node.displayName,
      color: (node.hasIconColor() ? node.getColor() : undefined)
    },
    selected: node.IsSelected(),
    checked: (checkBoxState === CheckBoxState.All),
    indeterminate: (checkBoxState === CheckBoxState.Some),
    disabled: (checkBoxState === CheckBoxState.Disabled),
    isRadio: (node.isRadio(null)),
    isFilter: node.isFilter(null),
    checkVisible: !(checkBoxState === CheckBoxState.Never),
    visible: node.isVisibleInTreeControl(),
    label: {
      italic: node.isLabelInItalic(),
      bold: node.isLabelInBold(),
      color: node.getLabelColor()
    },
    domainObject: node
  };
}

// Generate Redux store compatible nodes data from root node
function generateExplorerData(root: BaseRootNode)
{
  const rootId = root.uniqueId.toString();
  const nodes: { [key: string]: any } = {};
  const tabs: { name: string; icon: string; nodeIds: string[] }[] = [];
  for (const child of root.children)
  {
    if (!child.isTab)
    {
      continue;
    }
    const nodeIds: string[] = [];
    const nodeList: [BaseNode] = [child];
    while (nodeList.length)
    {
      const node = nodeList.shift()!;
      const uniqueId = node.uniqueId.toString();
      const parentId = node.parent ? node.parent.uniqueId.toString() : null;
      nodes[uniqueId] = generateNodeStructure(
        uniqueId,
        parentId === rootId ? null : parentId,
        node
      );
      if (node.childCount)
      {
        nodeList.push(...node.children);
      }
      nodeIds.push(uniqueId);
    }
    tabs.push({ name: child.displayName, icon: child.getIcon(), nodeIds });
  }
  return { nodes, tabs };
}

const initialState: ExplorerState = {
  tabs: [],
  selectedTabIndex: 0,
  selectedNode: null,
  checkedNodeIds: new Set<string>()
};

// Redux Toolkit package includes a createReducer utility that uses Immer internally.
// Because of this, we can write reducers that appear to "mutate" state, but the updates
// are actually applied immutably.
export default createReducer(initialState, {
  [GENERATE_NODE_TREE]: (state, action) =>
  {
    const { root } = action.payload;
    const { nodes, tabs } = generateExplorerData(root);
    state.nodes = nodes;
    state.tabs = tabs;
  },
  [TOGGLE_NODE_EXPAND]: (state, action) =>
  {
    const { uniqueId, expandState } = action.payload;
    state.nodes![uniqueId].expanded = expandState;
  },

  /**************************  Notification Adapter Action Start *************************/

  [CHANGE_CHECKBOX_STATE]: (state, action) =>
  {
    const uniqueId = action.appliesTo;
    const treeNodeState = state.nodes![uniqueId];
    if (treeNodeState === undefined) return; //TODO: When could this happen?
    const checkNode = state.nodes![uniqueId];
    switch (action.payload)
    {
      case "checked":
        checkNode.checked = true;
        checkNode.indeterminate = false;
        checkNode.disabled = false;
        // tslint:disable-next-line:no-console
        //console.log('changed state of ', checkNode.name, ' to checked');
        state.checkedNodeIds.add(uniqueId);
        break;
      case "unchecked":
        checkNode.checked = false;
        checkNode.indeterminate = false;
        checkNode.disabled = false;
        // tslint:disable-next-line:no-console
        //console.log('changed state of ', checkNode.name, ' to un-checked');
        break;
      case "disabled":
        checkNode.checked = false;
        checkNode.indeterminate = false;
        checkNode.disabled = true;
        // tslint:disable-next-line:no-console
        //console.log('changed state of ', checkNode.name, ' to un-checked');
        break;
      case "partial":
        checkNode.indeterminate = true;
        checkNode.checked = false;
        checkNode.disabled = false;
        // tslint:disable-next-line:no-console
        //console.log('changed state of ', checkNode.name, ' to partial');
        break;
      default:
      // do nothing
    }
  },
  [CHANGE_SELECTED_TAB]: (state, action) =>
  {
    const { tabIndex } = action.payload;
    state.selectedTabIndex = tabIndex;
  },
  [CHANGE_SELECT_STATE]: (state, action) =>
  {
    const uniqueId = action.appliesTo;
    const selectStatus = action.payload;
    const node = state.nodes![uniqueId];

    if (node)
    {
      state.nodes![uniqueId].selected = selectStatus;

      if (selectStatus)
      {
        state.selectedNode = uniqueId;
      }
    }
  },
  [CHANGE_NODE_NAME]: (state, action) =>
  {
    const uniqueId = action.appliesTo;
    state.nodes![uniqueId].name = action.payload;
  },
  [CHANGE_NODE_COLOR]: (state, action) =>
  {
    const uniqueId = action.appliesTo;
    const nodeColor = action.payload;
    const icon = state.nodes![uniqueId].icon;
    if (icon)
      icon!.color = nodeColor;
  }
});
