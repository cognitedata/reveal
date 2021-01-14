import { CdfClient } from 'utils';
import { RootDispatcher } from 'store/types';
import { Group } from '@cognite/sdk';
import { ADMIN_GROUP_NAME } from 'constants/cdf';
import * as actions from './actions';

export const fetchUserGroups = (client: CdfClient) => async (
  dispatch: RootDispatcher
) => {
  dispatch(actions.loadGroups());
  try {
    const groups: Group[] = await client.getUserGroups();
    dispatch(actions.loadedGroups(groups));
  } catch (e) {
    dispatch(actions.loadGroupsError(e));
  }
};

export const fetchAllUserGroups = (client: CdfClient) => async (
  dispatch: RootDispatcher
) => {
  dispatch(actions.loadAllGroups());
  try {
    const groups: Group[] = await client.getAllUserGroups();
    dispatch(actions.loadedAllGroups(groups));
  } catch (e) {
    dispatch(actions.loadGroupsError(e));
  }
};

export const checkIsAdmin = (groups: Group[]): boolean => {
  return getGroupNames(groups).includes(ADMIN_GROUP_NAME);
};

function getGroupNames(groups: Group[] = []): string[] {
  return groups.map((group) => group.name);
}
