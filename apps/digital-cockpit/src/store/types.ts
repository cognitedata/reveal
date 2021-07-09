import { DeepPartial, Store } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'store/reducer';
import { AuthRootAction, AuthState } from './auth/types';
import { SuitesTableRootAction, SuitesTableState } from './suites/types';
import { ModalRootAction, ModalState } from './modals/types';
import { GroupsState, UserGroupsRootAction } from './groups/types';
import { UserSpaceRootAction, UserSpaceState } from './userSpace/types';
import { FormRootAction, FormState } from './forms/types';
import {
  NotificationState,
  NotificationRootAction,
} from './notification/types';
import { ConfigState, ConfigRootAction } from './config/types';
import { LayoutRootAction, LayoutState } from './layout/types';

export type PartialRootState = DeepPartial<RootState>;

export type StoreAction =
  | SuitesTableRootAction
  | UserGroupsRootAction
  | AuthRootAction
  | ModalRootAction
  | UserSpaceRootAction
  | FormRootAction
  | NotificationRootAction
  | ConfigRootAction
  | LayoutRootAction;

export type StoreState = {
  suitesTable: SuitesTableState;
  auth: AuthState;
  modal: ModalState;
  groups: GroupsState;
  userSpace: UserSpaceState;
  form: FormState;
  notification: NotificationState;
  config: ConfigState;
  layout: LayoutState;
};

export type AppStore = Store<StoreState, StoreAction>;

export type RootDispatcher = ThunkDispatch<StoreState, undefined, StoreAction>;
