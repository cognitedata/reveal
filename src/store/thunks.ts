import { ApiClient } from 'utils';
import { RootDispatcher } from 'store/types';
import * as Sentry from '@sentry/browser';
import { getMetrics } from 'utils/metrics';
import { setHttpError } from 'store/notification/thunks';
import { Metrics } from '@cognite/metrics';
import { checkIsAdmin } from 'utils/groups';
import * as suiteActions from './suites/actions';
import * as groupActions from './groups/actions';

export const fetchAppData = (apiClient: ApiClient, metrics: Metrics) => async (
  dispatch: RootDispatcher
) => {
  dispatch(groupActions.loadGroups());
  dispatch(suiteActions.loadSuitesTable());
  try {
    const { groups, suites } = await apiClient.getAppData();
    dispatch(groupActions.loadedGroups(groups));
    dispatch(suiteActions.loadedSuitesTable(suites));
    const isAdmin = checkIsAdmin(groups);
    Sentry.addBreadcrumb({
      category: 'auth',
      message: `Is admin user: ${isAdmin}`,
      level: Sentry.Severity.Info,
    });
    getMetrics().people({ isAdmin });
  } catch (e) {
    if (e?.status === 404) {
      // is it still needed?
      dispatch(groupActions.loadedGroups([]));
      dispatch(suiteActions.loadedSuitesTable([]));
      dispatch(setHttpError('Failed to fetch app data', e));
      Sentry.captureException(e);
    } else if (e?.status === 403) {
      dispatch(groupActions.loadedGroups([]));
      dispatch(suiteActions.loadedSuitesTable([]));
      metrics.track('NotAuthorizedUser');
    } else {
      dispatch(groupActions.loadGroupsError(e));
      dispatch(suiteActions.loadSuitesTableFailed(e));
      dispatch(setHttpError('Failed to fetch app data', e));
      Sentry.captureException(e);
    }
  }
};
