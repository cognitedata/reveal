import { StoreState } from 'store/types';
import { Suite, SuitesTableState } from './types';

export const getSuitesTableState = (state: StoreState): SuitesTableState =>
  state.suitesTable;

export const getBoardsBySuite = (key: string) => (
  state: StoreState
): Suite | undefined =>
  state.suitesTable.suites?.find((suite) => suite.key === key);

export const getLastVisited = (itemsToDisplay: number = 6) => (
  state: StoreState
): Suite[] | undefined =>
  (state.suitesTable?.suites || [])
    .sort(
      (x: Suite, y: Suite) =>
        new Date(y?.lastUpdatedTime as Date).getTime() -
        new Date(x?.lastUpdatedTime as Date).getTime()
    )
    .slice(0, itemsToDisplay);
