import { CdfClient, ApiClient } from 'utils';
import { SUITES_TABLE_NAME } from 'constants/cdf';
import { RootDispatcher } from 'store/types';
import { setNotification } from 'store/notification/actions';
import { setHttpError } from 'store/notification/thunks';
import * as Sentry from '@sentry/browser';
import { CogniteExternalId } from '@cognite/sdk';
import { Metrics } from '@cognite/metrics';
import { SuiteRow, Suite, SuiteRowInsert, SuiteRowDelete } from './types';
import * as actions from './actions';

export const fetchSuites = (apiClient: ApiClient, metrics?: Metrics) => async (
  dispatch: RootDispatcher
) => {
  dispatch(actions.loadSuitesTable());
  try {
    const suites: Suite[] = await getSuites(apiClient);
    dispatch(actions.loadedSuitesTable(suites as Suite[]));
  } catch (e) {
    if (e?.status === 404) {
      dispatch(actions.loadedSuitesTable([]));
      if (e.message.includes('database not found')) {
        // eslint-disable-next-line no-console
        console.warn(
          'In order to use digital-cockpit, a database named `digital-cockpit` needs to be created in RAW'
        );
      }
      if (e.message.includes('table not found')) {
        // eslint-disable-next-line no-console
        console.warn(
          'In order to use digital-cockpit, a table named `suites` needs to be created in the database `digital-cockpit` in RAW'
        );
      }
      return;
    }
    dispatch(actions.loadSuitesTableFailed());
    if (e?.code === 403 && metrics) {
      metrics.track('NotAuthorizedUser');
    } else {
      dispatch(setHttpError(`Failed to fetch suites`, e));
      Sentry.captureException(e);
    }
  }
};

export const insertSuite = (
  client: CdfClient,
  apiClient: ApiClient,
  suite: Suite
) => async (dispatch: RootDispatcher) => {
  dispatch(actions.insertSuiteTableRow());
  try {
    const suiteRow = fromSuiteToRow(suite);
    await client.insertTableRow(SUITES_TABLE_NAME, suiteRow);
    dispatch(fetchSuites(apiClient));
    dispatch(setNotification('Saved'));
  } catch (e) {
    dispatch(actions.suiteTableRowError());
    dispatch(setHttpError('Failed to save a suite', e));
    Sentry.captureException(e);
  }
};

export const deleteSuite = (
  client: CdfClient,
  apiClient: ApiClient,
  key: SuiteRowDelete[]
) => async (dispatch: RootDispatcher) => {
  try {
    dispatch(actions.deleteSuiteTableRow());
    await client.deleteTableRow(SUITES_TABLE_NAME, key);
    dispatch(fetchSuites(apiClient));
    dispatch(setNotification('Deleted successfully'));
  } catch (e) {
    dispatch(actions.suiteTableRowError());
    dispatch(setHttpError('Failed to delete a suite', e));
    Sentry.captureException(e);
  }
};

export function deleteFiles(
  client: CdfClient,
  fileExternalIds: CogniteExternalId[]
) {
  return async (dispatch: RootDispatcher) => {
    try {
      await client.deleteFiles(fileExternalIds);
    } catch (e) {
      Sentry.captureException(e);
      dispatch(
        setHttpError(
          `Failed to delete image preview(s): ${fileExternalIds.join(',')}`,
          e
        )
      );
    }
  };
}

export const fetchImageUrls = (client: CdfClient, ids: string[]) => async (
  dispatch: RootDispatcher
) => {
  try {
    dispatch(actions.fetchImgUrls());
    const imgUrls = await client.getDownloadUrls(ids);
    dispatch(actions.fetchedImgUrls(imgUrls));
  } catch (e) {
    dispatch(actions.fetchImgUrlsFailed());
    dispatch(setHttpError('Failed to fetch image urls ', e));
    Sentry.captureException(e);
  }
};

async function getSuites(apiClient: ApiClient) {
  const { items: rows } = await apiClient.getSuitesRows();
  return getSuitesFromRows(rows);
}

function getSuitesFromRows(rows: SuiteRow[] = []): Suite[] {
  return rows.map(
    (row) =>
      ({
        key: row.key,
        lastUpdatedTime: row.lastUpdatedTime,
        ...row.columns,
      } as Suite)
  );
}

function fromSuiteToRow(suite: Suite) {
  const { key, ...rest } = suite;
  return [{ key, columns: rest }] as SuiteRowInsert[];
}
