import { StoreState } from 'store/types';
import { GroupsState } from './types';

export const getGroupsState = (state: StoreState): GroupsState => state.groups;

export const isAdmin = (state: StoreState): boolean => state.groups.isAdmin;
