import { createReducer } from 'typesafe-actions';
import {
  UserSpaceState,
  UserSpaceActionTypes,
  UserSpaceRootAction,
  UserSpacePayload,
} from './types';

const initialState: UserSpaceState = {
  loading: false,
  loaded: false,
  error: '',
  lastVisited: [],
};

export const UserSpaceReducer = createReducer(initialState)
  .handleAction(
    UserSpaceActionTypes.USER_SPACE_LOAD,
    (state: UserSpaceState) => ({
      ...state,
      loading: true,
      error: '',
    })
  )
  .handleAction(
    UserSpaceActionTypes.USER_SPACE_LOADED,
    (state: UserSpaceState, action: UserSpaceRootAction) => ({
      loading: false,
      loaded: true,
      error: '',
      lastVisited: (action.payload as UserSpacePayload)?.lastVisited,
    })
  )
  .handleAction(
    UserSpaceActionTypes.USER_SPACE_LOAD_ERROR,
    (state: UserSpaceState, action: UserSpaceRootAction) => ({
      ...state,
      loading: false,
      error: (action.payload as Error)?.message,
    })
  )
  .handleAction(
    UserSpaceActionTypes.USER_SPACE_UPDATE,
    (state: UserSpaceState) => ({ ...state, loading: true, error: '' })
  )
  .handleAction(
    UserSpaceActionTypes.USER_SPACE_UPDATED,
    (state: UserSpaceState, action: UserSpaceRootAction) => ({
      ...state,
      loading: false,
      error: '',
      loaded: true,
      lastVisited: action.payload,
    })
  )
  .handleAction(
    UserSpaceActionTypes.USER_SPACE_UPDATE_ERROR,
    (state: UserSpaceState, action: UserSpaceRootAction) => ({
      ...state,
      loading: false,
      error: (action.payload as Error)?.message,
    })
  );
