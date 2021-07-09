import { createReducer } from 'typesafe-actions';
import { Group } from '@cognite/sdk';
import { checkIsAdmin } from 'utils/groups';
import {
  GroupsState,
  UserGroupsActionTypes,
  UserGroupsRootAction,
} from './types';

export const initialState: GroupsState = {
  loading: false,
  loaded: false,
  error: '',
  groups: null,
  isAdmin: false,
  filter: [],
};

export const GroupsReducer = createReducer(initialState)
  .handleAction(
    UserGroupsActionTypes.USER_GROUPS_LOAD,
    (state: GroupsState) => ({
      ...state,
      loading: true,
      error: '',
    })
  )
  .handleAction(
    UserGroupsActionTypes.USER_GROUPS_LOADED,
    (state: GroupsState, action: UserGroupsRootAction) => ({
      ...state,
      loading: false,
      loaded: true,
      error: '',
      groups: action.payload as Group[],
      isAdmin: checkIsAdmin(action.payload as Group[]),
      filter: [],
    })
  )
  .handleAction(
    UserGroupsActionTypes.USER_GROUPS_ERROR,
    (state: GroupsState, action: UserGroupsRootAction) => ({
      ...state,
      loading: false,
      error: (action.payload as Error)?.message,
    })
  )
  .handleAction(
    UserGroupsActionTypes.SET_GROUP_FILTER,
    (state: GroupsState, action: UserGroupsRootAction) => ({
      ...state,
      filter: action.payload as string[],
    })
  )
  .handleAction(
    UserGroupsActionTypes.CLEAR_GROUP_FILTER,
    (state: GroupsState) => ({
      ...state,
      filter: [],
    })
  );
