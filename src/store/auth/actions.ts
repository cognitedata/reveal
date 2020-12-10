import { createAction } from 'typesafe-actions';
import { AuthActionTypes } from './types';

export const authRequest = createAction(AuthActionTypes.AUTH_REQUEST)<void>();

export const authSuccess = createAction(AuthActionTypes.AUTH_SUCCESS)<void>();
