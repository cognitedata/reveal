import { TitleBarInterface, ToolBarType } from "./common";

// Describes the return type of actions fired from Settings component
export interface SettingsCommandInterface {
  type: String;
  payload: SettingsCommandPayloadType;
}

// Describes the payload of actions fired from Settings component
export type SettingsCommandPayloadType = {
  sectionId: number;
  subSectionId?: number;
  elementIndex?: number;
  iconIndex?: number;
  subElementIndex?: number;
  value?: string | number | unknown;
  node?: any;
};

// Settings component state interface
export interface SettingsStateInterface {
  id: string | null;
  titleBar?: TitleBarInterface;
  sections: Array<SettingsSectionInterface>;
}

// Settings Section
export interface SettingsSectionInterface {
  name: string;
  isExpanded: boolean;
  titleBar?: TitleBarInterface;
  toolBar?: ToolBarType;
  elements: Array<SectionElement>;
  iconIndex?: number;
  subSections?: Array<SettingsSectionInterface>;
}

// Settings Section Element
export interface SectionElement {
  label?: string;
  type: string;
  value?: any;
  isReadOnly?: boolean;
  checked?: boolean;
  options?: Array<{
    name: string;
    icon?: {
      type: string;
      name: string;
    };
  }>;
  icon?: {
    type: string;
    name: string;
    selected?: boolean;
  };
  subElements?: Array<SectionElement>;
}
