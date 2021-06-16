import { createReducer } from 'typesafe-actions';
import {
  ConfigActionTypes,
  ConfigState,
  ConfigRootAction,
  ConfigItems,
} from './types';

export const ConfigReducer = createReducer({}).handleAction(
  ConfigActionTypes.ADD_CONFIG_ITEMS,
  (state: ConfigState, action: ConfigRootAction) => ({
    ...state,
    ...(action.payload as ConfigItems),
  })
);
