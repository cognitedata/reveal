import { StoreState } from 'store/types';
import { AuthState } from './types';

export const getAuthState = (state: StoreState): AuthState => state.auth;

export const getUserId = (state: StoreState): string => state.auth?.userId;
