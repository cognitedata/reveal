import { createAction } from 'typesafe-actions';
import { AppConfigurationActionTypes, AppConfiguration } from './types';

export const loadAppConfiguration = createAction(
  AppConfigurationActionTypes.APP_CONFIGURATION_LOAD
)<void>();

export const loadedAppConfiguration = createAction(
  AppConfigurationActionTypes.APP_CONFIGURATION_LOADED
)<AppConfiguration>();
