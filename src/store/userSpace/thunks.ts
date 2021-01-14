import { ApiClient } from 'utils';
import { RootDispatcher } from 'store/types';
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
  dispatch(actions.lastVisitedUpdate());
  try {
    apiClient.updateLastVisited(lastVisited);
    dispatch(actions.lastVisitedUpdated(lastVisited));
  } catch (e) {
    actions.lastVisitedUpdateError(e);
  }
};
