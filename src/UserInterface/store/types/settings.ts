// Action type constants
export const UPDATE_VIEWER = 'UPDATE_VIEWER'

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