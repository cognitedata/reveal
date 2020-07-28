import {TitleBarState} from "@/UserInterface/Redux/State/settings";
import UsePropertyT from "@/Core/Property/Base/UsePropertyT";

// ToolBar interface
export type ToolBarType = {
  icon: { type: string; name: string };
  selected?: boolean;
  action?: {
    type: string;
    subSectionId?: string;
  };
}[];

export interface SettingsSection {
  name: string;
  isExpanded: boolean;
  titleBar?: TitleBarState;
  toolBar?: ToolBarType;
  elementIds: string[];
  iconIndex?: number;
  subSectionIds?: string[];
}

// Settings Section Element
export interface SectionElement {
  propertyObject: UsePropertyT<any>;
  label?: string;
  type: string;
  value?: any;
  isReadOnly?: boolean;
  checked?: boolean;
  options?: {
    name: string | number;
    icon?: {
      type: string;
      name: string;
    };
  }[];
  icon?: {
    type: string;
    name: string;
    selected?: boolean;
  };
  subElementIds?: string[];
}



