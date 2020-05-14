import { ON_EXPAND_CHANGE, ON_TEXT_INPUT_CHANGE, ON_SELECT_CHANGE, ON_COMPACT_COLOR_CHANGE } from "../types/settings"

export const onExpandChange = (payload) =>
{
  return { type: ON_EXPAND_CHANGE, payload }
};

export const onTextInputChange = (payload) =>
{
  return { type: ON_TEXT_INPUT_CHANGE, payload }
};

export const onSelectChange = (payload) =>
{
  return { type: ON_SELECT_CHANGE, payload }
};

export const onCompactColorChange = (payload) =>
{
  return { type: ON_COMPACT_COLOR_CHANGE, payload }
};

export const change = (payload) =>
{
  return { type: "CHANGE", payload }
};