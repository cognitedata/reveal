import type { StoreState } from '../types';

export const selectIsAuthenticated = (state: StoreState) =>
  state.app.isAuthenticated;

export const selectIsInitialized = (state: StoreState) =>
  state.app.isInitialized;
