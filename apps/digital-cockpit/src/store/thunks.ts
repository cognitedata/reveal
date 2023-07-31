import { ApiClient, CdfClient } from 'utils';
import { RootDispatcher } from 'store/types';
import * as Sentry from '@sentry/browser';
import { getMetrics } from 'utils/metrics';
import { MixedHttpError, setHttpError } from 'store/notification/thunks';
import { Metrics } from '@cognite/metrics';
import { checkIsAdmin } from 'utils/groups';
import defaultCustomerLogo from 'images/default_logo.png';
import * as layoutActions from 'store/layout/actions';

import { CUSTOMER_LOGO_ID } from '../constants';

import * as suiteActions from './suites/actions';
import * as groupActions from './groups/actions';
import * as configActions from './config/actions';

export const fetchAppData =
  (apiClient: ApiClient, metrics: Metrics) =>
  async (dispatch: RootDispatcher) => {
    dispatch(groupActions.loadGroups());
    dispatch(suiteActions.loadSuitesTable());
    try {
      // get user groups configuration
      const {
        values: [useAllGroupsConfig],
      } = await apiClient.getAppConfigItem('useAllGroups');
      const linkedGroupsOnly = useAllGroupsConfig !== 'true';
      dispatch(
        configActions.addConfigItems({
          useAllGroups: useAllGroupsConfig === 'true',
        })
      );
      // get the app data
      const {
        groups,
        suites,
        applications,
        layouts = [],
      } = await apiClient.getAppData(linkedGroupsOnly);
      dispatch(layoutActions.layoutsLoaded(layouts));
      dispatch(groupActions.loadedGroups(groups));
      dispatch(suiteActions.loadedSuitesTable(suites));
      dispatch(configActions.addConfigItems({ applications }));
      const isAdmin = checkIsAdmin(groups);
      Sentry.addBreadcrumb({
        category: 'auth',
        message: `Is admin user: ${isAdmin}`,
        level: Sentry.Severity.Info,
      });
      getMetrics().people({ isAdmin });
    } catch (e) {
      const error = e as MixedHttpError;
      if (error?.status === 404) {
        dispatch(suiteActions.loadedSuitesTable([]));
        dispatch(setHttpError('Failed to fetch app data', error));
        Sentry.captureException(e);
      } else if (error?.status === 403) {
        dispatch(suiteActions.loadedSuitesTable([]));
        metrics.track('NotAuthorizedUser');
      } else {
        dispatch(suiteActions.loadSuitesTableFailed());
        dispatch(setHttpError('Failed to fetch app data', error));
        Sentry.captureException(e);
      }

      // try to load user groups
      try {
        const groups = await apiClient.getUserGroups();
        dispatch(groupActions.loadedGroups(groups));
      } catch (err) {
        dispatch(setHttpError('Failed to fetch user groups', error));
        Sentry.captureException(err);
      }
    }
  };

export const fetchCustomerLogoUrl =
  (client: CdfClient, setCustomerLogoUrl: (logo: string) => void) =>
  async (dispatch: RootDispatcher) => {
    try {
      const { downloadUrl } = (
        await client.getDownloadUrls([CUSTOMER_LOGO_ID])
      )[0];
      setCustomerLogoUrl(downloadUrl);
    } catch (e) {
      const error = e as MixedHttpError;
      setCustomerLogoUrl(defaultCustomerLogo);
      if (error.status !== 400 && error.status !== 403) {
        Sentry.captureException(e);
        dispatch(setHttpError(`Failed to fetch a logo`, error));
      }
    }
  };
