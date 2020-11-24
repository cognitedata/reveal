import { StoreState } from 'store/types';
import { Suite, SuitesTableState } from './types';

export const getSuitesTableState = (state: StoreState): SuitesTableState =>
  state.suitesTable;

export const getDashboarsdBySuite = (key: string) => (
  state: StoreState
): Suite | undefined =>
  state.suitesTable.suites?.find((suite) => suite.key === key);
