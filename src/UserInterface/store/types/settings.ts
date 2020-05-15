// Action type constants
export const ON_EXPAND_CHANGE = "ON_EXPAND_CHANGE";
export const ON_TEXT_INPUT_CHANGE = "ON_TEXT_INPUT_CHANGE";
export const ON_SELECT_CHANGE = "ON_SELECT_CHANGE";
export const ON_COMPACT_COLOR_CHANGE = "ON_COMPACT_COLOR_CHANGE";
export const ON_EXPAND_CHANGE_FROM_TOOLBAR = "ON_EXPAND_CHANGE_FROM_TOOLBAR";

// Action interfaces
export interface SettingsAction
{
  type: String
  payload: {}
}

// Settings action types
export type SettingsActionTypes = SettingsAction
// Settings state interface
export interface SettingsState
{
  id: string,
  titleBar: {
    name: string,
    icon?: {
      type: string,
      name: string
    },
    toolBar: {
      icon?: {
        type: string,
        name: string
      },
      action?: Function
    }[]
  },

}