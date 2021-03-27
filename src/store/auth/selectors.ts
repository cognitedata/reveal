import { StoreState } from 'store/types';

export const getUserId = (state: StoreState): string => state.auth?.userId;
