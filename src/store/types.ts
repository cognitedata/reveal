import { Store } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { AuthRootAction, AuthState } from './auth/types';
import { SuitesTableRootAction, SuitesTableState } from './suites/types';
import { ModalRootAction, ModalState } from './modals/types';

export type StoreAction =
  | SuitesTableRootAction
  | AuthRootAction
  | ModalRootAction;

export type StoreState = {
  suitesTable: SuitesTableState;
  auth: AuthState;
  modal: ModalState;
};

export type AppStore = Store<StoreState, StoreAction>;

export type RootDispatcher = ThunkDispatch<StoreState, undefined, StoreAction>;
