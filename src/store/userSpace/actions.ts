import { createAction } from 'typesafe-actions';
import { UserSpaceActionTypes, UserSpacePayload } from './types';

export const loadUserSpace = createAction(
  UserSpaceActionTypes.USER_SPACE_LOAD
)<void>();

export const loadedUserSpace = createAction(
  UserSpaceActionTypes.USER_SPACE_LOADED
)<UserSpacePayload>();

export const loadUserSpaceError = createAction(
  UserSpaceActionTypes.USER_SPACE_LOAD_ERROR
)<Error>();

export const userSpaceUpdated = createAction(
  UserSpaceActionTypes.USER_SPACE_UPDATED
)<UserSpacePayload>();

export const updateUserSpace = createAction(
  UserSpaceActionTypes.USER_SPACE_UPDATE
)<void>();

export const updateUserSpaceError = createAction(
  UserSpaceActionTypes.USER_SPACE_UPDATE_ERROR
)<Error>();
