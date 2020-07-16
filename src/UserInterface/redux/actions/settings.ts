import {
    ON_EXPAND_CHANGE,
    ON_EXPAND_CHANGE_FROM_TOOLBAR,
    ON_CHANGE_SETTING_AVAILABILITY,
    ON_INPUT_CHANGE,
    ON_SELECTED_NODE_CHANGE,
    CHANGE_SETTINGS_PROPERTY
} from "../types/actionTypes";

import { SettingsCommandPayloadType, SettingsStateInterface } from "../../interfaces/settings";

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
export const onSelectedNodeChange = (payload: SettingsStateInterface) =>
{
    return { type: ON_SELECTED_NODE_CHANGE, payload };
};
export const changeSettingProperty = (appliesTo: string, payload?: any) =>
{
    return { type: CHANGE_SETTINGS_PROPERTY, appliesTo, payload };
};
