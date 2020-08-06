import Color from "color";

// Explorer component state interface
export interface IExplorerState
{
  tabs: string[];
  selectedTabIndex: number;
  selectedNodeId: string | null;
  nodes: {
    byId: { [id: string]: ITreeNodeState },
    allIds: string[]
  }
}

// Explorer Redux Node interface
export interface ITreeNodeState
{
  nodeType: string, // node Type is used to identify whether node is well type, surface type ..etc
  parentId?: string | null;
  uniqueId: string;
  name: string;
  expanded: boolean;
  icon: {
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
