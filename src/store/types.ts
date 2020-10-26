import { Store } from 'redux';
import {
  AppConfigurationRootAction,
  AppConfigurationState,
} from './configuration/types';

export type StoreAction = AppConfigurationRootAction;

export type StoreState = {
  appConfiguration: AppConfigurationState;
};

export type AppStore = Store<StoreState, StoreAction>;
