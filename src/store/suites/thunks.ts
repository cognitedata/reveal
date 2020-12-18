import { CdfClient, ApiClient } from 'utils';
import { SUITES_TABLE_NAME } from 'constants/cdf';
import { RootDispatcher } from 'store/types';
import { SuiteRow, Suite, SuiteRowInsert, SuiteRowDelete } from './types';
import * as actions from './actions';

export const fetchSuites = (apiClient: ApiClient) => async (
  dispatch: RootDispatcher
) => {
  dispatch(actions.loadSuitesTable());
  try {
    const suites: Suite[] = await getSuites(apiClient);
    dispatch(actions.loadedSuitesTable(suites as Suite[]));
  } catch (e) {
    dispatch(actions.loadSuitesTableError(e));
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
    dispatch(actions.suiteTableRequestSuccess());
    dispatch(fetchSuites(apiClient));
  } catch (e) {
    dispatch(actions.insertSuiteTableRowError(e));
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
    dispatch(actions.suiteTableRequestSuccess());
    dispatch(fetchSuites(apiClient));
  } catch (e) {
    dispatch(actions.deleteSuiteTableRowError(e));
  }
};

async function getSuites(apiClient: ApiClient) {
  const { items: rows } = await apiClient.getSuitesRows();
  return getSuitesFromRows(rows);
}

function getSuitesFromRows(rows: SuiteRow[]): Suite[] {
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
