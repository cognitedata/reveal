import { BaseNode } from "@/Core/Nodes/BaseNode";
import { RootNode } from "@/Nodes/TreeNodes/RootNode";
import * as Color from "color"

// Explorer component state interface
export interface ExplorerStateInterface {
  root: RootNode;
  tabConfig?: {
    name: string;
    value: string;
    icon: {
      type: string;
      name: string;
    };
  }[];
  selectedNodeType: { value: number; name: string };
  selectedNode: string | null;
  checkedNodeIds: Set<string>;
  nodes?: { [key: string]: TreeDataItem };
}

// Explorer redux Node interface
export interface TreeDataItem {
  parentId?: string | null;
  uniqueId: string;
  name: string;
  type: string;
  expanded: boolean;
  icon?: {
    path: string;
    description?: string;
    color?: Color;
  };
  selected: boolean;
  checked: boolean;
  indeterminate: boolean;
  isRadio: boolean;
  isFilter: boolean;
  disabled: boolean;
  visible: boolean;
  domainObject?: BaseNode; // Reference to BaseNode/WellNode/SurfaceNode..etc
}

// Explorer UI Tree Node interface
export interface TreeNode {
  uniqueId: string;
  name: string;
  expanded: boolean;
  type: string;
  icon?: {
    path: string;
    description?: string;
    color?: Color;
  };
  selected: boolean;
  checked: boolean;
  indeterminate: boolean;
  isRadio: boolean;
  isFilter: boolean;
  disabled: boolean;
  visible: boolean;
  children: TreeNode[];
}

export type ExplorerCommandPayloadType = {
  uniqueId?: string;
  expandState?: boolean;
  checkState?: boolean;
  selectState?: boolean;
  root?: RootNode;
  nodeType?: string;
  nodeTypeIndex?: number;
};
