import {
    ON_EXPAND_CHANGE,
    ON_EXPAND_CHANGE_FROM_TOOLBAR,
    ON_CHANGE_SETTING_AVAILABILITY,
    ON_INPUT_CHANGE,
    ON_SELECTED_NODE_CHANGE,
    CHANGE_SETTINGS_PROPERTY
} from "./actionTypes";
import {SettingsState} from "@/UserInterface/Redux/State/settings";


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

export const onExpandChange = (payload: SettingsCommandPayloadType) =>
{
    return { type: ON_EXPAND_CHANGE, payload };
};
export const onInputChange = (payload: SettingsCommandPayloadType) =>
{
    return { type: ON_INPUT_CHANGE, payload };
};
export const onExpandChangeFromToolbar = (payload: SettingsCommandPayloadType) =>
{
    return { type: ON_EXPAND_CHANGE_FROM_TOOLBAR, payload };
};
export const onChangeSettingAvailability = (payload: SettingsCommandPayloadType) =>
{
    return { type: ON_CHANGE_SETTING_AVAILABILITY, payload };
};
export const onSelectedNodeChange = (payload: SettingsState) =>
{
    return { type: ON_SELECTED_NODE_CHANGE, payload };
};
export const changeSettingProperty = (appliesTo: string, payload?: any) =>
{
    return { type: CHANGE_SETTINGS_PROPERTY, appliesTo, payload };
};
