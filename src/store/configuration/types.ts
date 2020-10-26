import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum AppConfigurationActionTypes {
  APP_CONFIGURATION_LOAD = 'configuration/LOAD',
  APP_CONFIGURATION_LOADED = 'configuration/LOADED',
}

export type AppConfigurationRootAction = ActionType<typeof actions>;

export type AppConfiguration = {
  name: string;
};

export interface AppConfigurationState {
  loading: boolean;
  saving: boolean;
  configuration: AppConfiguration | null;
}
