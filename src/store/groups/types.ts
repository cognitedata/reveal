import { Group } from '@cognite/sdk';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum UserGroupsActionTypes {
  USER_GROUPS_LOAD = 'userGroups/LOAD',
  USER_GROUPS_LOADED = 'userGroups/LOADED',
  USER_ALL_GROUPS_LOAD = 'userGroups/ALL_LOAD',
  USER_ALL_GROUPS_LOADED = 'userGroups/ALL_LOADED',
  USER_GROUPS_ERROR = 'userGroups/ERROR',
}

export type UserGroupsootAction = ActionType<typeof actions>;

export interface GroupsState {
  loading: boolean;
  loaded: boolean;
  error?: string;
  groups: Group[] | null;
  allGroups: Group[] | null;
  isAdmin: boolean;
}
