import { createAction } from 'typesafe-actions';
import { LastVisited, UserSpaceActionTypes, UserSpacePayload } from './types';

export const loadUserSpace = createAction(
  UserSpaceActionTypes.USER_SPACE_LOAD
)<void>();

export const loadedUserSpace = createAction(
  UserSpaceActionTypes.USER_SPACE_LOADED
)<UserSpacePayload>();

export const loadUserSpaceError = createAction(
  UserSpaceActionTypes.USER_SPACE_LOAD_ERROR
)<Error>();

export const lastVisitedUpdate = createAction(
  UserSpaceActionTypes.LAST_VISITED_UPDATE
)<void>();

export const lastVisitedUpdated = createAction(
  UserSpaceActionTypes.LAST_VISITED_UPDATED
)<LastVisited[]>();

export const lastVisitedUpdateError = createAction(
  UserSpaceActionTypes.LAST_VISITED_UPDATE_ERROR
)<Error>();
