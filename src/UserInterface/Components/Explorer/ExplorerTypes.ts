import { ITreeNode } from "@/UserInterface/Components/VirtualTree/ITreeNode";

export interface ExplorerTab
{
  name: string;
  icon: string;
  type: string | null;
}

export interface ExplorerPropType
{
  onTabChange: (tabIndex: number) => void;
  onNodeExpandToggle: (nodeId: string, expandState: boolean) => void;
  onToggleVisible: (nodeId: string) => void;
  onNodeSelect: (nodeId: string, selectState: boolean) => void;
  data: ITreeNode[];
  tabs: ExplorerTab[];
  selectedTabIndex: number;
}

export interface ExplorerTabsPropType
{
  tabs: ExplorerTab[];
  selectedTabIndex: number;
  onTabChange: (tabIndex: number) => void;
}
