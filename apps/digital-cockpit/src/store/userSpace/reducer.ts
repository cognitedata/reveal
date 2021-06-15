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
  lastVisited: [],
};

export const UserSpaceReducer = createReducer(initialState)
  .handleAction(
    UserSpaceActionTypes.USER_SPACE_LOAD,
    (state: UserSpaceState) => ({
      ...state,
      loading: true,
    })
  )
  .handleAction(
    UserSpaceActionTypes.USER_SPACE_LOADED,
    (_: UserSpaceState, action: UserSpaceRootAction) => ({
      loading: false,
      loaded: true,
      lastVisited: (action.payload as UserSpacePayload)?.lastVisited,
    })
  )
  .handleAction(
    UserSpaceActionTypes.USER_SPACE_LOAD_ERROR,
    (state: UserSpaceState) => ({
      ...state,
      loading: false,
    })
  )
  .handleAction(
    UserSpaceActionTypes.LAST_VISITED_UPDATE,
    (state: UserSpaceState) => ({ ...state, loading: true })
  )
  .handleAction(
    UserSpaceActionTypes.LAST_VISITED_UPDATED,
    (state: UserSpaceState, action: UserSpaceRootAction) => ({
      ...state,
      loading: false,
      loaded: true,
      lastVisited: action.payload,
    })
  )
  .handleAction(
    UserSpaceActionTypes.LAST_VISITED_UPDATE_ERROR,
    (state: UserSpaceState) => ({
      ...state,
      loading: false,
    })
  );
