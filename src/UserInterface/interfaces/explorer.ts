// Explorer component state interface
export interface ExplorerStateInterface {
  selectedNode: string | null;
  checkedNodeIds: Set<string>;
  nodes?: { [key: string]: TreeDataItem };
}

// Explorer redux Node interface
export interface TreeDataItem {
  parentId?: string;
  id: string;
  name: string;
  expanded: boolean;
  icon: { type: string; name: string };
  iconDescription: string;
  selected: boolean;
  checked: boolean;
  indeterminate: boolean;
  isRadio: boolean;
  isFilter: boolean;
  disabled: boolean;
  visible: boolean;
  uniqueId: string;
  domainObject?: any; // Reference to BaseNode/WellNode/SurfaceNode..etc
}

// Explorer UI Tree Node interface
export interface TreeNode {
  parentId?: string;
  id: string;
  name: string;
  expanded: boolean;
  icon: { type: string; name: string };
  iconDescription: string;
  selected: boolean;
  checked: boolean;
  indeterminate: boolean;
  isRadio: boolean;
  isFilter: boolean;
  disabled: boolean;
  visible: boolean;
  uniqueId: string;
  children: Array<TreeNode>;
}

export type ExplorerCommandPayloadType = {
  uniqueId?: string;
  expandState?: boolean;
  checkState?: boolean;
  selectState?: boolean;
};
