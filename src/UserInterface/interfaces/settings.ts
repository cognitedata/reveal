import { TitleBarInterface, ToolBarType } from "./common";

// Settings action interfaces
export interface SettingsActionInterface {
  type: String;
  payload: SettingsActionPayloadType;
}

// Settings action payload type
export type SettingsActionPayloadType = {
  sectionId: number;
  subSectionId?: number;
  elementIndex?: number;
  iconIndex?: number;
  subElementIndex?: number;
  value?: string | number | unknown;
  node?: any;
};

// Settings state interface
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
  label: string;
  type: string;
  value?: string | number;
  isReadOnly?: boolean;
  checked: boolean;
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
