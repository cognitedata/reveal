import { createReducer } from 'typesafe-actions';
import { Group } from '@cognite/sdk';
import {
  GroupsState,
  UserGroupsActionTypes,
  UserGroupsootAction,
} from './types';
import { checkIsAdmin } from './thunks';

const initialState: GroupsState = {
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
    (state: GroupsState, action: UserGroupsootAction) => ({
      ...state,
      loading: false,
      loaded: true,
      error: '',
      groups: action.payload,
      isAdmin: checkIsAdmin(action.payload as Group[]),
      filter: [],
    })
  )
  .handleAction(
    UserGroupsActionTypes.USER_GROUPS_ERROR,
    (state: GroupsState, action: UserGroupsootAction) => ({
      ...state,
      loading: false,
      error: (action.payload as Error)?.message,
    })
  )
  .handleAction(
    UserGroupsActionTypes.SET_GROUP_FILTER,
    (state: GroupsState, action: UserGroupsootAction) => ({
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
