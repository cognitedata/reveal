import { ITreeNode } from "@/UserInterface/Components/VirtualTree/TreeNode";

export type ExplorerTab = {
  name: string;
  icon: string;
  type: string | null;
}

export type ExplorerPropType = {
  onTabChange: (tabIndex: number) => void;
  onNodeExpandToggle: (nodeId: string, expandState: boolean) => void;
  onNodeVisibilityChange: (nodeId: string, visible: boolean) => void;
  onNodeSelect: (nodeId: string, selectState: boolean) => void;
  data: ITreeNode[];
  tabs: ExplorerTab[];
  selectedTabIndex: number;
};

export type ExplorerTabsPropType = {
  tabs: ExplorerTab[];
  selectedTabIndex: number;
  onTabChange: (tabIndex: number) => void;
}
