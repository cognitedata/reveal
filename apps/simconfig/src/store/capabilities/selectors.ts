import type { StoreState } from 'store/types';

export const selectCapabilities = (state: StoreState) => state.capabilities;
