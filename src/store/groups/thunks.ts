import { ApiClient } from 'utils';
import { RootDispatcher } from 'store/types';
import { Group } from '@cognite/sdk';
import { ADMIN_GROUP_NAME } from 'constants/cdf';
import * as actions from './actions';

export const fetchUserGroups = (apiClient: ApiClient) => async (
  dispatch: RootDispatcher
) => {
  dispatch(actions.loadGroups());
  try {
    const groups: Group[] = await apiClient.getUserGroups();
    dispatch(actions.loadedGroups(groups));
  } catch (e) {
    dispatch(actions.loadGroupsError(e));
  }
};

export const checkIsAdmin = (groups: Group[]): boolean =>
  getGroupNames(groups).includes(ADMIN_GROUP_NAME);

function getGroupNames(groups: Group[] = []): string[] {
  return groups.map((group) => group.name);
}
