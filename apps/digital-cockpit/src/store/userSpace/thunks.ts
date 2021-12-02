import { ApiClient } from 'utils';
import { RootDispatcher } from 'store/types';
import { MixedHttpError, setHttpError } from 'store/notification/thunks';
import * as Sentry from '@sentry/browser';

import * as actions from './actions';
import { LastVisited, UserSpacePayload } from './types';

export const fetchUserSpace =
  (apiClient: ApiClient) => async (dispatch: RootDispatcher) => {
    dispatch(actions.loadUserSpace());
    try {
      const userSpace: UserSpacePayload = await apiClient.getUserSpace();
      dispatch(actions.loadedUserSpace(userSpace));
    } catch (e) {
      const error = e as MixedHttpError;
      dispatch(actions.loadUserSpaceError(error));
      if (error?.code !== 404) {
        dispatch(setHttpError('Failed to fetch user space', error));
        Sentry.captureException(e);
      }
    }
  };
export const updateLastVisited =
  (apiClient: ApiClient, lastVisited: LastVisited[]) =>
  async (dispatch: RootDispatcher) => {
    dispatch(actions.lastVisitedUpdate());
    try {
      await apiClient.updateLastVisited(lastVisited);
      dispatch(actions.lastVisitedUpdated(lastVisited));
    } catch (e) {
      dispatch(actions.lastVisitedUpdateError());
      Sentry.captureException(e);
    }
  };
