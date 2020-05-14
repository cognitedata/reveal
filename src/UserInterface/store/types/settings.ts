// Action type constants
export const ON_EXPAND_CHANGE = 'ON_EXPAND_CHANGE'

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