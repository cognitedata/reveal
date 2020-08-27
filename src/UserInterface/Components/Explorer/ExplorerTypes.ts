import { ITreeNode } from "@/UserInterface/Components/VirtualTree/ITreeNode";

export type ExplorerTab = {
  name: string;
  icon: string;
  type: string | null;
}

export type ExplorerPropType = {
  onTabChange: (tabIndex: number) => void;
  onNodeExpandToggle: (nodeId: string, expandState: boolean) => void;
  onToggleVisible: (nodeId: string) => void;
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
