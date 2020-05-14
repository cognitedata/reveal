import { ON_EXPAND_CHANGE } from "../types/settings"

export const onExpandChange = (payload) =>
{
  return { type: ON_EXPAND_CHANGE, payload }
};