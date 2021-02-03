import { Group } from '@cognite/sdk';
import { createAction } from 'typesafe-actions';
import { UserGroupsActionTypes } from './types';

export const loadGroups = createAction(
  UserGroupsActionTypes.USER_GROUPS_LOAD
)<void>();

export const loadedGroups = createAction(
  UserGroupsActionTypes.USER_GROUPS_LOADED
)<Group[]>();

export const loadGroupsError = createAction(
  UserGroupsActionTypes.USER_GROUPS_ERROR
)<Error>();

export const setGroupsFilter = createAction(
  UserGroupsActionTypes.SET_GROUP_FILTER
)<string[]>();

export const clearGroupsFilter = createAction(
  UserGroupsActionTypes.CLEAR_GROUP_FILTER
)<void>();
