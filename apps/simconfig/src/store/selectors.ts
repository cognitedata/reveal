import type { StoreState } from '@simint-app/store/types';

export const selectIsAppInitialized = (state: StoreState) =>
  state.group.initialized;
