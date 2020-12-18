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
  allGroups: null,
  isAdmin: false,
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
    (state: GroupsState, action: UserGroupsootAction) => {
      return {
        ...state,
        loading: false,
        loaded: true,
        error: '',
        groups: action.payload,
        isAdmin: checkIsAdmin(action.payload as Group[]),
      };
    }
  )
  .handleAction(
    UserGroupsActionTypes.USER_ALL_GROUPS_LOAD,
    (state: GroupsState) => ({
      ...state,
      loading: true,
      error: '',
    })
  )
  .handleAction(
    UserGroupsActionTypes.USER_ALL_GROUPS_LOADED,
    (state: GroupsState, action: UserGroupsootAction) => {
      return {
        ...state,
        loading: false,
        loaded: true,
        error: '',
        allGroups: action.payload,
      };
    }
  )
  .handleAction(
    UserGroupsActionTypes.USER_GROUPS_ERROR,
    (state: GroupsState, action: UserGroupsootAction) => ({
      ...state,
      loading: false,
      error: (action.payload as Error)?.message,
    })
  );
