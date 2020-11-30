import { CdfClient } from 'utils';
import { SUITES_TABLE_NAME } from 'constants/cdf';
import { RootDispatcher } from 'store/types';
import { SuiteRow, Suite, SuiteRowInsert, SuiteRowDelete } from './types';
import * as actions from './actions';

export const fetchSuites = (client: CdfClient) => async (
  dispatch: RootDispatcher
) => {
  dispatch(actions.loadSuitesTable());
  try {
    const suites: Suite[] = await getSuites(client);
    dispatch(actions.loadedSuitesTable(suites as Suite[]));
  } catch (e) {
    dispatch(actions.loadSuitesTableError(e));
  }
};

export const insertSuite = (
  client: CdfClient,
  suite: SuiteRowInsert[]
) => async (dispatch: RootDispatcher) => {
  dispatch(actions.insertSuiteTableRow());
  try {
    await client.insertTableRow(SUITES_TABLE_NAME, suite);
    dispatch(actions.insertedSuiteTableRow());
    dispatch(fetchSuites(client));
  } catch (e) {
    dispatch(actions.insertSuiteTableRowError(e));
  }
};

export const deleteSuite = (client: CdfClient, key: SuiteRowDelete[]) => async (
  dispatch: RootDispatcher
) => {
  try {
    dispatch(actions.deleteSuiteTableRow());
    await client.deleteTableRow(SUITES_TABLE_NAME, key);
    dispatch(actions.deletedSuiteTableRow());
    dispatch(fetchSuites(client));
  } catch (e) {
    dispatch(actions.deleteSuiteTableRowError(e));
  }
};
async function getSuites(client: CdfClient) {
  const { items: rows } = await client.getTableRows(SUITES_TABLE_NAME);
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
