import { ITreeNode } from "@/UserInterface/Components/VirtualTree/ITreeNode";

export interface VirtualTreeProps
{
  data?: ITreeNode[];
  iconSize?: number;
  rowHeight?: number;
  expandable?: boolean;
  onToggleNodeSelect: (id: string, state: boolean) => void;
  onToggleNodeExpand: (id: string, state: boolean) => void;
  onToggleNodeCheck: (id: string, state: boolean) => void;
}
