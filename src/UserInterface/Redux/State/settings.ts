import {SectionElement, SettingsSection, ToolBarType} from "@/UserInterface/Components/Settings/Types";

// TitleBar interface
export interface TitleBarState {
  name: string;
  icon: { type: string; name: string };
  toolBar: ToolBarType;
}

// Settings component state interface
export interface SettingsState {
  id: string | null;
  titleBar?: TitleBarState;
  sections: { [key: string]: SettingsSection };
  subSections: { [key: string]: SettingsSection };
  elements: { [key: string]: SectionElement };
  subElements: { [key: string]: SectionElement };
}


