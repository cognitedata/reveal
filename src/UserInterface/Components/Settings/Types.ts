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
  onSectionExpand: (sectionId: string, expandStatus: boolean) => void;
  onPropertyValueChange: (elementId: string, value: any) => void;
  onPropertyUseChange: (elementId: string, value: boolean) => void;
};

export interface ISettingsSectionProps 
{
  section: ISettingsSection;
  onExpand: (id: string, expandStatus: boolean) => void;
  onPropertyValueChange: (elementId: string, value: any) => void;
  onPropertyUseChange: (elementId: string, value: boolean) => void;
}

export interface ISettingsElementProps 
{
  config: ISettingsElement;
  sectionId: string;
  onPropertyValueChange: (id: string, value: any) => void;
  onPropertyUseChange: (id: string, value: boolean) => void;
}

// TitleBar interface
export interface ITitleBar 
{
  name: string;
  icon: { type: string; name: string };
  toolBar: ToolBarType;
}

// SettingsPanel SettingsSection Prop Type
export interface ISettingsSection
{
  id: string;
  name: string;
  isExpanded?: boolean;
  titleBar?: ITitleBar;
  toolBar?: ToolBarType;
  elements: ISettingsElement[];
  iconIndex?: number;
  subSections?: ISettingsSection[];
}

// SettingsPanel SettingsSection Element
export interface ISettingsElement extends IBaseSettingsElement
{
  options?: ISelectOption[] | string[];
  colorMapOptions?: string[][];
  icon?: {
    type: string;
    name: string;
    selected?: boolean;
  };
  subValues?: IBaseSettingsElement[];
}

export interface IBaseSettingsElement 
{
  id: string;
  name: string;
  type: string;
  value?: any;
  isReadOnly?: boolean;
  useProperty: boolean; 
  isOptional: boolean;
}

// SettingsPanel Option selector option
export interface ISelectOption 
{
  label: string;
  value: any;
  iconSrc?: string
}
