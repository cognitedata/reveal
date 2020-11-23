import { Store } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { AuthRootAction, AuthState } from './auth/types';
import { SuitesTableRootAction, SuitesTableState } from './suites/types';

export type StoreAction = SuitesTableRootAction | AuthRootAction;

export type StoreState = {
  suitesTable: SuitesTableState;
  auth: AuthState;
};

export type AppStore = Store<StoreState, StoreAction>;

export type RootDispatcher = ThunkDispatch<StoreState, undefined, StoreAction>;
