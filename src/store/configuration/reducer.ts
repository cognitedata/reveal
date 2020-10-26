import { createReducer } from 'typesafe-actions';
import {
  AppConfigurationActionTypes,
  AppConfigurationRootAction,
  AppConfigurationState,
} from './types';

const initialState: AppConfigurationState = {
  loading: false,
  saving: false,
  configuration: null,
};

export const ConfigurationReducer = createReducer(initialState)
  .handleAction(
    AppConfigurationActionTypes.APP_CONFIGURATION_LOAD,
    (state: AppConfigurationState) => ({ ...state, loading: true })
  )
  .handleAction(
    AppConfigurationActionTypes.APP_CONFIGURATION_LOADED,
    (state: AppConfigurationState, action: AppConfigurationRootAction) => ({
      ...state,
      loading: false,
      configuration: action.payload,
    })
  );
