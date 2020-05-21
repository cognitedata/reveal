import { TitleBarInterface, ToolBarType } from "./common";

// Describes the return type of actions fired from Settings component
export interface SettingsCommandInterface {
  type: String;
  payload: SettingsCommandPayloadType;
}

// Describes the payload of actions fired from Settings component
export type SettingsCommandPayloadType = {
  sectionId?: string;
  subSectionId?: string;
  elementIndex?: string;
  iconIndex?: number;
  subElementIndex?: string;
  expandState?: boolean;
  value?: string | number | unknown;
  node?: any;
};

// Settings component state interface
export interface SettingsStateInterface {
  id: string | null;
  titleBar?: TitleBarInterface;
  sections: { [key: string]: SettingsSectionInterface };
  subSections: { [key: string]: SettingsSectionInterface };
  elements: { [key: string]: SectionElement };
  subElements: { [key: string]: SectionElement };
}

// Settings Section
export interface SettingsSectionInterface {
  name: string;
  isExpanded: boolean;
  titleBar?: TitleBarInterface;
  toolBar?: ToolBarType;
  elementIds: Array<string>;
  iconIndex?: number;
  subSectionIds?: Array<string>;
}

// Settings Section Element
export interface SectionElement {
  label?: string;
  type: string;
  value?: any;
  isReadOnly?: boolean;
  checked?: boolean;
  options?: Array<{
    name: string | number;
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
  subElementIds?: Array<string>;
}
