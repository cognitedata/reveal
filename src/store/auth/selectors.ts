import { StoreState } from 'store/types';
import { AuthState } from './types';

export const getAuthState = (state: StoreState): AuthState => state.auth;
