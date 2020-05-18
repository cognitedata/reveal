import {
  ON_EXPAND_CHANGE,
  ON_TEXT_INPUT_CHANGE,
  ON_SELECT_INPUT_CHANGE,
  ON_RANGE_INPUT_CHANGE,
  ON_COMPACT_COLOR_CHANGE,
  ON_EXPAND_CHANGE_FROM_TOOLBAR,
  GENERATE_SETTINGS_CONFIG,
  ON_CHANGE_SETTING_AVAILABILITY,
} from "../types/settings";

export const onExpandChange = (payload) => {
  return { type: ON_EXPAND_CHANGE, payload };
};

export const onTextInputChange = (payload) => {
  return { type: ON_TEXT_INPUT_CHANGE, payload };
};

export const onSelectChange = (payload) => {
  return { type: ON_SELECT_INPUT_CHANGE, payload };
};

export const onRangeChange = (payload) => {
  return { type: ON_RANGE_INPUT_CHANGE, payload };
};

export const onCompactColorChange = (payload) => {
  return { type: ON_COMPACT_COLOR_CHANGE, payload };
};

export const onExpandChangeFromToolbar = (payload) => {
  return { type: ON_EXPAND_CHANGE_FROM_TOOLBAR, payload };
};

export const generateSettingsConfig = (payload) => {
  return { type: GENERATE_SETTINGS_CONFIG, payload };
};

export const onChangeSettingAvailability = (payload) => {
  return { type: ON_CHANGE_SETTING_AVAILABILITY, payload };
};
