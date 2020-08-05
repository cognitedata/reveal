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
  titleBar?: { name: string; icon: { type: string; name: string }; toolBar: ToolBarType };
  sections: ISettingsSection[];
  onSectionExpand: (sectionId: string, expandStatus: boolean) => void;
  onSettingChange: (elementId: string, value: any) => void;
};

// TitleBar interface
export interface ITitleBar {
  name: string;
  icon: { type: string; name: string };
  toolBar: ToolBarType;
}

// SettingsPanel SettingsSection Prop Type
export interface ISettingsSection
{
  name: string;
  isExpanded: boolean;
  titleBar?: ITitleBar;
  toolBar?: ToolBarType;
  elements: ISettingsElement[];
  iconIndex?: number;
  subSections: ISettingsSection[];
}

// SettingsPanel SettingsSection Element
export interface ISettingsElement
{
  name: string;
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
  subElements?: ISettingsElement[];
}
