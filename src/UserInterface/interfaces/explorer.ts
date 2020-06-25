import { BaseNode } from "@/Core/Nodes/BaseNode";
import Color from "color";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";

// Explorer component state interface
export interface ExplorerStateInterface {
  tabs: {
    name: string;
    icon: string;
    nodeIds: string[]
  }[];
  selectedTabIndex: number;
  selectedNode: string | null;
  checkedNodeIds: Set<string>;
  nodes?: { [key: string]: TreeDataItem };
}

// Explorer redux Node interface
export interface TreeDataItem {
  parentId?: string | null;
  uniqueId: string;
  name: string;
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
  label: {
    italic: boolean;
    bold: boolean;
    color: Color
  }
  domainObject?: BaseNode; // Reference to BaseNode/WellNode/SurfaceNode..etc
}

export type ExplorerCommandPayloadType = {
  uniqueId?: string;
  expandState?: boolean;
  checkState?: boolean;
  selectState?: boolean;
  root?: BaseRootNode;
  tabIndex?: number;
};
