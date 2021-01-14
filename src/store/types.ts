import { Store } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { AuthRootAction, AuthState } from './auth/types';
import { SuitesTableRootAction, SuitesTableState } from './suites/types';
import { ModalRootAction, ModalState } from './modals/types';
import { GroupsState, UserGroupsootAction } from './groups/types';
import { UserSpaceRootAction, UserSpaceState } from './userSpace/types';
import { FormRootAction, FormState } from './forms/types';

export type StoreAction =
  | SuitesTableRootAction
  | UserGroupsootAction
  | AuthRootAction
  | ModalRootAction
  | UserSpaceRootAction
  | FormRootAction;

export type StoreState = {
  suitesTable: SuitesTableState;
  auth: AuthState;
  modal: ModalState;
  groups: GroupsState;
  userSpace: UserSpaceState;
  form: FormState;
};

export type AppStore = Store<StoreState, StoreAction>;

export type RootDispatcher = ThunkDispatch<StoreState, undefined, StoreAction>;
