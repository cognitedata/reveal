import { CdfClient, ApiClient } from 'utils';
import { RootDispatcher } from 'store/types';
import { RawDBRowInsert } from '@cognite/sdk';
import * as actions from './actions';
import { LastVisited, UserSpacePayload } from './types';

export const fetchUserSpace = (apiClient: ApiClient) => async (
  dispatch: RootDispatcher
) => {
  dispatch(actions.loadUserSpace());
  try {
    const userSpace: UserSpacePayload = await apiClient.getUserSpace();
    dispatch(actions.loadedUserSpace(userSpace));
  } catch (e) {
    dispatch(actions.loadUserSpaceError(e));
  }
};
export const updateLastVisited = (
  apiClient: ApiClient,
  lastVisited: LastVisited[]
) => async (dispatch: RootDispatcher) => {
  dispatch(actions.updateUserSpace());
  try {
    apiClient.updateLastVisited(lastVisited);
  } catch (e) {
    actions.updateUserSpaceError(e);
  }
};
// TODO(DTC-222) temporary update directly on CDF
export const updateLastVisitedCdf = (
  client: CdfClient,
  userId: string,
  lastVisited: LastVisited[]
) => async (dispatch: RootDispatcher) => {
  dispatch(actions.updateUserSpace());
  try {
    client.insertTableRow(
      'LastVisited',
      lastVisitedToDBRow(userId, lastVisited)
    );
  } catch (e) {
    actions.updateUserSpaceError(e);
  }
};
function lastVisitedToDBRow(
  userId: string,
  lastVisited: LastVisited[]
): RawDBRowInsert[] {
  return [
    {
      key: userId,
      columns: {
        lastVisited,
      },
    },
  ];
}
// TODO(DTC-222) temporary fetch directly from CDF
export const fetchUserSpaceCdf = (
  cdfClient: CdfClient,
  userId: string
) => async (dispatch: RootDispatcher) => {
  dispatch(actions.loadUserSpace());
  try {
    const userSpace: UserSpacePayload = await fetchAndExtract(
      cdfClient,
      userId
    );
    dispatch(actions.loadedUserSpace(userSpace));
  } catch (e) {
    dispatch(actions.loadUserSpaceError(e));
  }
};
async function fetchAndExtract(
  cdfClient: CdfClient,
  userId: string
): Promise<UserSpacePayload> {
  try {
    const { columns } = await cdfClient.getTableRow('lastVisited', userId);
    const { lastVisited: lastVisitedItems } = columns;
    lastVisitedItems?.sort(
      (a: LastVisited, b: LastVisited) =>
        ((b.lastVisitedTime as any) as number) -
        ((a.lastVisitedTime as any) as number)
    );
    return Promise.resolve({
      lastVisited: lastVisitedItems,
    } as UserSpacePayload);
  } catch (e) {
    return Promise.reject(e);
  }
}
