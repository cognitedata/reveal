import {
  CustomDataNode,
  TreeDataNode,
} from 'pages/RevisionDetails/components/TreeView/types';

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
  payload: { modelId: number; revisionId: number };
};
export type InitialFetchOk = {
  type: 'treeView/initialFetchOk';
  payload: Array<TreeDataNode>;
};
export type InitialFetchError = {
  type: 'treeView/initialFetchError';
  payload: { error: Error };
};

export type LoadAncestorsOk = {
  type: 'treeView/loadAncestorsOk';
  payload: {
    treeData: Array<TreeDataNode>;
    checkedNodes: Array<TreeIndex>;
    nodeUnknownChildrenAreHidden: Record<number, boolean>;
  };
};
export type LoadAncestorsError = {
  type: 'treeView/loadAncestorsError';
  payload: { error: Error };
};

export type ResetState = { type: 'treeView/resetState' };

export type Actions =
  | ResetState
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
  | LoadAncestorsOk
  | LoadAncestorsError;

export type SelectedNode = {
  treeIndex: number;
  nodeId: number;
  subtreeSize: number;
};

export type TreeViewState = {
  checkedNodes: Array<TreeIndex>;

  /*
   * Used to determine if newly fetched child nodes should be in checked state or not.
   * If falsy - not-fetched nodes must be checked.
   */
  nodeUnknownChildrenAreHidden: Record<number, boolean>;

  error: Error | null;
  expandedNodes: Array<TreeIndex>;

  // used only for initial loading state
  loading: boolean;

  loadingCursors: Array<string>;

  // used to track if fetched data is still needed
  revisionId: number | null;
  modelId: number | null;

  selectedNodes: Array<SelectedNode>;
  treeData: Array<TreeDataNode>;
};
