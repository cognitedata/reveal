import {
  ON_EXPAND_CHANGE,
  ON_TEXT_INPUT_CHANGE,
  ON_SELECT_INPUT_CHANGE,
  ON_RANGE_INPUT_CHANGE,
  ON_COMPACT_COLOR_CHANGE,
  ON_EXPAND_CHANGE_FROM_TOOLBAR,
  ON_CHANGE_SETTING_AVAILABILITY,
} from "../types/settings";

import { SettingsCommandPayloadType } from "../../interfaces/settings";

export const onExpandChange = (payload: SettingsCommandPayloadType) => {
  return { type: ON_EXPAND_CHANGE, payload };
};

export const onTextInputChange = (payload: SettingsCommandPayloadType) => {
  return { type: ON_TEXT_INPUT_CHANGE, payload };
};

export const onSelectChange = (payload: SettingsCommandPayloadType) => {
  return { type: ON_SELECT_INPUT_CHANGE, payload };
};

export const onRangeChange = (payload: SettingsCommandPayloadType) => {
  return { type: ON_RANGE_INPUT_CHANGE, payload };
};

export const onCompactColorChange = (payload: SettingsCommandPayloadType) => {
  return { type: ON_COMPACT_COLOR_CHANGE, payload };
};

export const onExpandChangeFromToolbar = (
  payload: SettingsCommandPayloadType
) => {
  return { type: ON_EXPAND_CHANGE_FROM_TOOLBAR, payload };
};

export const onChangeSettingAvailability = (
  payload: SettingsCommandPayloadType
) => {
  return { type: ON_CHANGE_SETTING_AVAILABILITY, payload };
};
