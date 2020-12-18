import { Group } from '@cognite/sdk';
import { createAction } from 'typesafe-actions';
import { UserGroupsActionTypes } from './types';

export const loadGroups = createAction(
  UserGroupsActionTypes.USER_GROUPS_LOAD
)<void>();

export const loadedGroups = createAction(
  UserGroupsActionTypes.USER_GROUPS_LOADED
)<Group[]>();

export const loadAllGroups = createAction(
  UserGroupsActionTypes.USER_ALL_GROUPS_LOAD
)<void>();

export const loadedAllGroups = createAction(
  UserGroupsActionTypes.USER_ALL_GROUPS_LOADED
)<Group[]>();

export const loadGroupsError = createAction(
  UserGroupsActionTypes.USER_GROUPS_ERROR
)<Error>();
