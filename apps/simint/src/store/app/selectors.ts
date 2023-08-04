import type { StoreState } from '@simint-app/store/types';

export const selectIsAuthenticated = (state: StoreState) =>
  state.app.isAuthenticated;

export const selectIsInitialized = (state: StoreState) =>
  state.app.isInitialized;
