import type { StoreState } from './types';

export const selectIsAppInitialized = (state: StoreState) =>
  state.group.initialized;
