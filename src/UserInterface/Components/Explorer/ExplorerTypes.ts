import { ITreeNode } from "@/UserInterface/Components/VirtualTree/ITreeNode";

export interface ExplorerTab {
  name: string;
  icon: string;
  type: string | null;
}

export interface ExplorerPropType {
  /**
   * Callback for explorer tabs change
   * @param tabIndex
   */
  onTabChange: (tabIndex: number) => void;
  /**
   * Callback for node expanding
   * @param nodeId
   * @param expandState
   */
  onNodeExpandToggle: (nodeId: string, expandState: boolean) => void;
  /**
   * callback for node visibility changes
   * @param nodeId
   */
  onToggleVisible: (nodeId: string) => void;
  /**
   * callback for node selection
   * @param nodeId
   * @param selectState
   */
  onNodeSelect: (nodeId: string, selectState: boolean) => void;
  /**
   * node tree to be rendered via component
   */
  data: ITreeNode[];
  /**
   * tabs available for node tree
   */
  tabs: ExplorerTab[];
  /**
   * current tab selection
   */
  selectedTabIndex: number;
}

export interface ExplorerTabsPropType {
  tabs: ExplorerTab[];
  selectedTabIndex: number;
  onTabChange: (tabIndex: number) => void;
}
