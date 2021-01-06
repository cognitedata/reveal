import {
  CustomDataNode,
  TreeDataNode,
} from 'src/pages/RevisionDetails/components/TreeView/types';

export type TreeIndex = number;
export type TreeParent = {
  nodeId: number;
  treeIndex: number;
};
export type LoadChildren = { type: 'treeView/loadChildren' };
export type LoadChildrenOk = {
  type: 'treeView/loadChildrenOk';
  payload: { subtreeItems: CustomDataNode[]; parentTreeIndex: number };
};
export type LoadChildrenError = {
  type: 'treeView/loadChildrenError';
  payload: { error: Error };
};

export type LoadSiblings = {
  type: 'treeView/loadSiblings';
  payload: { cursorKey: string };
};
export type LoadSiblingsOk = {
  type: 'treeView/loadSiblingsOk';
  payload: {
    cursorKey: string;
    subtreeItems: CustomDataNode[];
    parent: TreeParent;
  };
};
export type LoadSiblingsError = {
  type: 'treeView/loadSiblingsError';
  payload: { cursorKey: string; error: Error };
};

export type NodeChecked = {
  type: 'treeView/nodeChecked';
  payload: Array<TreeIndex>;
};
export type NodeExpanded = {
  type: 'treeView/nodeExpanded';
  payload: Array<TreeIndex>;
};
export type NodeSelected = {
  type: 'treeView/nodeSelected';
  payload: Array<SelectedNode>;
};

export type InitialFetch = {
  type: 'treeView/initialFetch';
};
export type InitialFetchOk = {
  type: 'treeView/initialFetchOk';
  payload: Array<TreeDataNode>;
};
export type InitialFetchError = {
  type: 'treeView/initialFetchError';
  payload: { error: Error };
};

// export type LoadAncestors = {
//   type: 'treeView/loadAncestors';
//   payload: { treeIndex: number };
// };
export type LoadAncestorsOk = {
  type: 'treeView/loadAncestorsOk';
  payload: { treeData: Array<CustomDataNode> };
};
export type LoadAncestorsError = {
  type: 'treeView/loadAncestorsError';
  payload: { error: Error };
};

export type Actions =
  | InitialFetch
  | InitialFetchOk
  | InitialFetchError
  //
  | NodeChecked
  | NodeExpanded
  | NodeSelected
  //
  | LoadChildren
  | LoadChildrenOk
  | LoadChildrenError
  //
  | LoadSiblings
  | LoadSiblingsOk
  | LoadSiblingsError
  //
  // | LoadAncestors
  | LoadAncestorsOk
  | LoadAncestorsError;

export type SelectedNode = {
  treeIndex: number;
  nodeId: number;
  subtreeSize?: number;
};

export type TreeViewState = {
  treeData: Array<CustomDataNode>;
  checkedNodes: Array<TreeIndex>;
  expandedNodes: Array<TreeIndex>;
  selectedNodes: Array<SelectedNode>;
  error: Error | null;
  loading: boolean; // used only for initial loading state
  loadingCursors: Array<string>;
};
