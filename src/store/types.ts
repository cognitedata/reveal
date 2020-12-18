import { Store } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { AuthRootAction, AuthState } from './auth/types';
import { SuitesTableRootAction, SuitesTableState } from './suites/types';
import { ModalRootAction, ModalState } from './modals/types';
import { GroupsState, UserGroupsootAction } from './groups/types';

export type StoreAction =
  | SuitesTableRootAction
  | UserGroupsootAction
  | AuthRootAction
  | ModalRootAction;

export type StoreState = {
  suitesTable: SuitesTableState;
  auth: AuthState;
  modal: ModalState;
  groups: GroupsState;
};

export type AppStore = Store<StoreState, StoreAction>;

export type RootDispatcher = ThunkDispatch<StoreState, undefined, StoreAction>;
