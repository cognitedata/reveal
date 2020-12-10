import { createReducer } from 'typesafe-actions';
import { AuthActionTypes, AuthState } from './types';

const initialState: AuthState = {
  authenticating: false,
  authenticated: false,
};

export const AuthReducer = createReducer(initialState)
  .handleAction(AuthActionTypes.AUTH_REQUEST, (state: AuthState) => ({
    ...state,
    authenticating: true,
  }))
  .handleAction(AuthActionTypes.AUTH_SUCCESS, (state: AuthState) => ({
    ...state,
    authenticating: false,
    authenticated: true,
  }));
