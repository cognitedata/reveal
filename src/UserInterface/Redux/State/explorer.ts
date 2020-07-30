import { BaseNode } from "@/Core/Nodes/BaseNode";
import Color from "color";

// Explorer component state interface
export interface ExplorerState
{
  tabs: {
    name: string;
    icon: string;
    nodeIds: string[]
  }[];
  selectedTabIndex: number;
  selectedNode: string | null;
  checkedNodeIds: Set<string>;
  nodes?: { [key: string]: TreeDataItemState };
}

// Explorer Redux Node interface
export interface TreeDataItemState
{
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
  checkVisible: boolean;
  visible: boolean;
  label: {
    italic: boolean;
    bold: boolean;
    color: Color
  }
}


