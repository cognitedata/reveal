import { StoreState } from 'store/types';
import { sortByLastUpdated } from 'utils/suites';
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
  sortByLastUpdated(state.suitesTable?.suites || [], 'desc').slice(
    0,
    itemsToDisplay
  );
