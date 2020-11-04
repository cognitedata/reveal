import { BaseCommand } from "@/Core/Commands/BaseCommand";
import { IconTypes } from "@/UserInterface/Components/Icon/IconTypes";

export type ToolBarType = {
  icon: { type: string; name: string };
  selected?: boolean;
  action?: {
    type: string;
    subSectionId?: string;
  };
}[];

// Setting panel Prop type
export type SettingPanelProps = {
  id?: string;
  titleBar?: { name: string; icon?: { src?: string; description?: string, color?: string }; toolBar: ToolBarType };
  expandedSections: {[sectionName: string]: boolean},
  onSectionExpand: (sectionId: string, expandStatus: boolean) => void;
  onPropertyValueChange: (elementId: string, value: any) => void;
  onPropertyUseChange: (elementId: string, value: boolean) => void;
};

export interface ISettingsSectionProps {
  section: ISettingsSection;
  onExpand: (id: string, expandStatus: boolean) => void;
  onPropertyValueChange: (elementId: string, value: any) => void;
  onPropertyUseChange: (elementId: string, value: boolean) => void;
}

export interface ISettingsElementProps {
  config: ISettingsElement;
  sectionId: string;
  onPropertyValueChange: (id: string, value: any) => void;
  onPropertyUseChange: (id: string, value: boolean) => void;
}

// TitleBar interface
export interface ITitleBar {
  name: string;
  icon: { type: string; name: string };
  toolBar: ToolBarType;
}

// SettingsPanel SettingsSection Prop Type
export interface ISettingsSection {
  id: string;
  name: string;
  isExpanded?: boolean;
  titleBar?: ITitleBar;
  toolBar?: BaseCommand[];
  elements: ISettingsElement[];
  iconIndex?: number;
  subSections?: ISettingsSection[];
}

// SettingsPanel SettingsSection Element
export interface ISettingsElement extends IBaseSettingsElement {
  options?: ISelectOption[];
  extraOptionsData?: ICommonSelectExtraOptionData[];
  icon?: {
    type: IconTypes;
    name: string;
    selected?: boolean;
  };
  subValues?: IBaseSettingsElement[];
}

export interface IBaseSettingsElement {
  id: string;
  name: string;
  type: string;
  toolTip?: string;
  value?: any;
  isReadOnly?: boolean;
  useProperty: boolean;
  isOptional: boolean;
}

// SettingsPanel Option selector option
export interface ISelectOption {
  label: string;
  value: any;
  iconSrc?: string
}

export interface ICommonSelectProps {
  id?: string;
  options?: ISelectOption[];
  extraOptionsData?: ICommonSelectExtraOptionData[];
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}
export interface ICommonSelectExtraOptionData {
  colorMapColors?: string[];
  colorTypeIconData?: { icon?: string, color?: string }
}
