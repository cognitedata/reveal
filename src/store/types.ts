import { Store } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { AuthRootAction, AuthState } from './auth/types';
import {
  AppConfigurationRootAction,
  AppConfigurationState,
} from './configuration/types';

export type StoreAction = AppConfigurationRootAction | AuthRootAction;

export type StoreState = {
  appConfiguration: AppConfigurationState;
  auth: AuthState;
};

export type AppStore = Store<StoreState, StoreAction>;

export type RootDispatcher = ThunkDispatch<StoreState, undefined, StoreAction>;
