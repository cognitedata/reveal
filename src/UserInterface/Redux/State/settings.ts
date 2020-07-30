import { ToolBarType } from "@/UserInterface/Components/Settings/Types";

// TitleBar interface
export interface TitleBarState
{
  name: string;
  icon: { type: string; name: string };
  toolBar: ToolBarType;
}

export interface ISettingsPropertyState
{
  name: string,
  displayName: string,
  type: string,
  value: number | string | boolean,
  children?: string[],
  parent?: string,
  readonly?: boolean,
  expanded?: boolean,
  tooltip?: string
}

// Settings component state interface
export interface ISettingsState
{
  currentNodeId: string;
  titleBar: TitleBarState;
  properties: {
    byId: { [id: string]: ISettingsPropertyState },
    allIds: string[]
  }
}
