import { Group } from '@cognite/sdk';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum UserGroupsActionTypes {
  USER_GROUPS_LOAD = 'userGroups/LOAD',
  USER_GROUPS_LOADED = 'userGroups/LOADED',
  USER_GROUPS_ERROR = 'userGroups/ERROR',
  SET_GROUP_FILTER = 'userGroups/SET_FILTER',
  CLEAR_GROUP_FILTER = 'userGroups/CLEAR_FILTER',
}

export type UserGroupsootAction = ActionType<typeof actions>;

export interface GroupsState {
  loading: boolean;
  loaded: boolean;
  error?: string;
  groups: Group[] | null;
  filter: string[];
  isAdmin: boolean;
}
