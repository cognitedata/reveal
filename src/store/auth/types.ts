import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum AuthActionTypes {
  AUTH_REQUEST = 'auth/REQUEST',
  AUTH_SUCCESS = 'auth/SUCCESS',
}

export type AuthRootAction = ActionType<typeof actions>;

export interface AuthState {
  authenticating: boolean;
  authenticated: boolean;
  userId: string;
}
