import { ToolBarType } from "@/UserInterface/Components/Settings/Types";

// TitleBar interface
export interface TitleBarState
{
  name: string;
  icon: { src?: string; description?: string; color?: string };
  toolBar: ToolBarType;
}

export interface ISettingsPropertyState
{
  name: string,
  displayName: string,
  type: string,
  value: number | string | boolean,
  children: string[],
  parent?: string,
  readonly?: boolean,
  expanded?: boolean,
  tooltip?: string,
  options?: any[],
  colorMapOptions?: string[][];
}

// Settings component state interface
export interface ISettingsState
{
  currentNodeId: string;
  titleBar: TitleBarState;
  expandedSections: {[sectionName: string]: boolean};
  updateUICount: number;
}
