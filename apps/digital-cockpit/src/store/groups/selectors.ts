import { StoreState } from 'store/types';
import { ADMIN_GROUP_NAME } from 'constants/cdf';
import { getGroupNames } from 'utils/groups';
import { GroupsState } from './types';

export const getGroupsState = (state: StoreState): GroupsState => state.groups;

export const isAdmin = (state: StoreState): boolean => state.groups.isAdmin;

export const getUsersGroupNames = (state: StoreState): string[] =>
  getGroupNames(state.groups?.groups || []).filter(
    (gname) => gname !== ADMIN_GROUP_NAME
  );

export const getCurrentFilter = (state: StoreState): string[] =>
  state.groups.filter;
