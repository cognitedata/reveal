import { CdfClient } from 'utils';
import { SUITES_TABLE_NAME } from 'contants';
import { RootDispatcher } from 'store/types';
import { SuiteRow, Suite } from './types';
import * as actions from './actions';

export const fetchSuits = (client: CdfClient) => async (
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
