import { ApiClient } from 'utils';
import { RootDispatcher } from 'store/types';
import { setHttpError } from 'store/notification/thunks';
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
    if (e?.code !== 404) {
      dispatch(setHttpError('Failed to fetch user space', e));
      // track to sentry
    }
  }
};
export const updateLastVisited = (
  apiClient: ApiClient,
  lastVisited: LastVisited[]
) => async (dispatch: RootDispatcher) => {
  dispatch(actions.lastVisitedUpdate());
  try {
    await apiClient.updateLastVisited(lastVisited);
    dispatch(actions.lastVisitedUpdated(lastVisited));
  } catch (e) {
    dispatch(actions.lastVisitedUpdateError());
    // track to sentry
  }
};
