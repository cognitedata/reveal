import { StoreState } from 'store/types';
import { LastVisited, UserSpaceState } from './types';

export const getUserSpace = (state: StoreState): UserSpaceState =>
  state.userSpace;

export const getLastVisited = (state: StoreState): LastVisited[] | undefined =>
  state.userSpace?.lastVisited;
