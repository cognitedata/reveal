import { createReducer } from 'typesafe-actions';
import { AuthActionTypes, AuthState, AuthRootAction } from './types';

const initialState: AuthState = {
  authenticating: false,
  authenticated: false,
  accessToken: '',
};

export const AuthReducer = createReducer(initialState)
  .handleAction(AuthActionTypes.AUTH_REQUEST, (state: AuthState) => ({
    ...state,
    authenticating: true,
  }))
  .handleAction(
    AuthActionTypes.AUTH_SUCCESS,
    (state: AuthState, action: AuthRootAction) => ({
      ...state,
      authenticating: false,
      authenticated: true,
      accessToken: action.payload,
    })
  );
